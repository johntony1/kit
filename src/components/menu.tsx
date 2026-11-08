/* Menu expand: a Menu pill that opens into a nested menu card. Ported from ~/Documents/Menu expand.
 * Pure CSS, as the source:
 *
 *  CARD            46 (pill) → 183 (open) + 152 per expanded section (335, 487)
 *  EASE            cubic-bezier(0.22, 1, 0.36, 1), 320ms, one curve
 *
 *  OPEN      0ms   pill content blurs + fades out (100ms)
 *            0ms   card resize tween starts
 *          140ms   dashboard row enters (y / blur / opacity, 360ms)
 *          +60ms   profile, resources, settings rows stagger in
 *  SECTION   0ms   chevron rotates 180°, drawer 0 → 142, margin 0 → 10
 *          120ms   first sub-row enters, +50ms each after
 *  CLOSE     rows fade out together, drawers collapse, card shrinks back
 *
 * In a short box the whole widget scales down (same curve) so the open card stays inside it. */

import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

// Remix icons from the source, inlined (viewBox, path); drawn in currentColor
const ICONS: Record<string, [string, string]> = {
  "arrow-down-s": ["0 0 9.546 5.8335", "M4.773 3.7125L8.4855 0L9.546 1.0605L4.773 5.8335L0 1.0605L1.0605 0L4.773 3.7125Z"],
  "coin": ["0 0 16.5 12", "M8.25 0C12.8062 0 16.5 2.0145 16.5 4.5V7.5C16.5 9.9855 12.8062 12 8.25 12C3.77475 12 0.132 10.0568 0.00375 7.63275L0 7.5V4.5C0 2.0145 3.69375 0 8.25 0ZM8.25 9C5.46 9 2.9925 8.24475 1.5 7.0875V7.5C1.5 8.9115 4.41225 10.5 8.25 10.5C12.0075 10.5 14.8785 8.9775 14.9963 7.5885L15 7.5L15.0007 7.0875C13.5082 8.244 11.0407 9 8.25 9ZM8.25 1.5C4.41225 1.5 1.5 3.0885 1.5 4.5C1.5 5.9115 4.41225 7.5 8.25 7.5C12.0878 7.5 15 5.9115 15 4.5C15 3.0885 12.0878 1.5 8.25 1.5Z"],
  "coins": ["0 0 15.0006 14.997", "M8.99778 6.84031e-07C10.3703 -0.000654414 11.7015 0.46925 12.7694 1.33134C13.8374 2.19344 14.5775 3.39561 14.8663 4.73735C15.1551 6.0791 14.9752 7.47931 14.3566 8.70446C13.7379 9.9296 12.718 10.9056 11.4668 11.4698C11.0668 12.3539 10.4584 13.1279 9.69367 13.7253C8.92893 14.3227 8.03069 14.7257 7.076 14.8998C6.12131 15.0738 5.13865 15.0137 4.2123 14.7245C3.28595 14.4354 2.44355 13.9259 1.75736 13.2397C1.07117 12.5535 0.56165 11.7111 0.272512 10.7847C-0.0166264 9.85838 -0.0767592 8.87572 0.0972704 7.92103C0.2713 6.96633 0.674299 6.0681 1.2717 5.30335C1.86911 4.53861 2.64309 3.93018 3.52728 3.53025C4.00288 2.47792 4.77197 1.58513 5.74228 0.958956C6.7126 0.332786 7.84296 -0.000177799 8.99778 6.84031e-07V6.84031e-07ZM5.99778 4.5C5.40683 4.5 4.82167 4.6164 4.2757 4.84254C3.72974 5.06869 3.23366 5.40016 2.8158 5.81802C2.39793 6.23588 2.06646 6.73196 1.84032 7.27793C1.61417 7.82389 1.49778 8.40905 1.49778 9C1.49778 9.59095 1.61417 10.1761 1.84032 10.7221C2.06646 11.268 2.39793 11.7641 2.8158 12.182C3.23366 12.5998 3.72974 12.9313 4.2757 13.1575C4.82167 13.3836 5.40683 13.5 5.99778 13.5C7.19125 13.5 8.33584 13.0259 9.17976 12.182C10.0237 11.3381 10.4978 10.1935 10.4978 9C10.4978 7.80653 10.0237 6.66193 9.17976 5.81802C8.33584 4.97411 7.19125 4.5 5.99778 4.5ZM6.74778 5.25V6H8.24778V7.5H5.24778C5.15407 7.49983 5.06369 7.53475 4.99444 7.59788C4.92519 7.66102 4.88209 7.74779 4.87362 7.84112C4.86515 7.93444 4.89193 8.02756 4.94869 8.10212C5.00545 8.17669 5.08807 8.22731 5.18028 8.244L5.24778 8.25H6.74778C7.24506 8.25 7.72197 8.44754 8.0736 8.79918C8.42523 9.15081 8.62278 9.62772 8.62278 10.125C8.62278 10.6223 8.42523 11.0992 8.0736 11.4508C7.72197 11.8025 7.24506 12 6.74778 12V12.75H5.24778V12H3.74778V10.5H6.74778C6.84148 10.5002 6.93186 10.4653 7.00111 10.4021C7.07036 10.339 7.11347 10.2522 7.12193 10.1589C7.1304 10.0656 7.10362 9.97244 7.04686 9.89788C6.9901 9.82331 6.90749 9.7727 6.81528 9.756L6.74778 9.75H5.24778C4.75049 9.75 4.27358 9.55246 3.92195 9.20083C3.57032 8.8492 3.37278 8.37228 3.37278 7.875C3.37278 7.37772 3.57032 6.90081 3.92195 6.54918C4.27358 6.19754 4.75049 6 5.24778 6V5.25H6.74778ZM8.99778 1.5C8.36229 1.49926 7.73389 1.63346 7.15414 1.89372C6.5744 2.15399 6.05652 2.53438 5.63478 3.00975C6.48247 2.95829 7.33144 3.08737 8.12553 3.38846C8.91962 3.68955 9.64075 4.15578 10.2412 4.75634C10.8417 5.35689 11.3079 6.07807 11.6089 6.8722C11.9099 7.66633 12.0388 8.51531 11.9873 9.363C12.6692 8.75672 13.1507 7.95746 13.3679 7.07123C13.5851 6.18501 13.5278 5.25369 13.2035 4.40079C12.8792 3.5479 12.3033 2.81373 11.5522 2.29566C10.8011 1.77759 9.91023 1.50011 8.99778 1.5V1.5Z"],
  "collage": ["0 0 13.5 13.5", "M12.75 0C13.164 0 13.5 0.336 13.5 0.75V12.75C13.5 13.164 13.164 13.5 12.75 13.5H0.75C0.336 13.5 0 13.164 0 12.75V0.75C0 0.336 0.336 0 0.75 0H12.75ZM6.14175 7.6185L1.5 8.4375V12H6.9135L6.141 7.6185H6.14175ZM12 1.5H6.58575L8.43675 12H12V1.5ZM5.0625 1.5H1.5V6.9135L5.8815 6.141L5.0625 1.5Z"],
  "dashboard-horizontal": ["0 0 12.5 12.5", "M0 4.86111C0 5.24465 0.310917 5.55556 0.694444 5.55556H6.25C6.63354 5.55556 6.94444 5.24465 6.94444 4.86111V0.694444C6.94444 0.310917 6.63354 0 6.25 0H0.694444C0.310917 0 0 0.310917 0 0.694444V4.86111ZM5.55556 11.8056C5.55556 12.1891 5.86646 12.5 6.25 12.5H11.8056C12.1891 12.5 12.5 12.1891 12.5 11.8056V7.63889C12.5 7.25535 12.1891 6.94444 11.8056 6.94444H6.25C5.86646 6.94444 5.55556 7.25535 5.55556 7.63889V11.8056ZM6.94444 8.33333H11.1111V11.1111H6.94444V8.33333ZM0 11.8056C0 12.1891 0.310917 12.5 0.694444 12.5H3.47222C3.85576 12.5 4.16667 12.1891 4.16667 11.8056V7.63889C4.16667 7.25535 3.85576 6.94444 3.47222 6.94444H0.694444C0.310917 6.94444 0 7.25535 0 7.63889V11.8056ZM1.38889 11.1111V8.33333H2.77778V11.1111H1.38889ZM1.38889 4.16667V1.38889H5.55556V4.16667H1.38889ZM11.8056 5.55556C12.1891 5.55556 12.5 5.24465 12.5 4.86111V0.694444C12.5 0.310917 12.1891 0 11.8056 0H9.02778C8.64424 0 8.33333 0.310917 8.33333 0.694444V4.86111C8.33333 5.24465 8.64424 5.55556 9.02778 5.55556H11.8056ZM11.1111 4.16667H9.72222V1.38889H11.1111V4.16667Z"],
  "file": ["0 0 13.5 15", "M4.50002 0.00225002V0H12.7485C13.1625 0 13.5 0.34125 13.5 0.744V14.256C13.4998 14.4534 13.4213 14.6426 13.2816 14.7821C13.142 14.9216 12.9527 15 12.7553 15H0.744769C0.646276 14.9993 0.548884 14.9792 0.458153 14.9409C0.367421 14.9026 0.285128 14.8468 0.215971 14.7766C0.146814 14.7065 0.092148 14.6234 0.0550948 14.5322C0.0180416 14.4409 -0.000673353 14.3432 1.85047e-05 14.2448V4.5L4.50002 0.00225002ZM2.12252 4.5H4.50002V2.1225L2.12252 4.5ZM6.00002 1.5V5.25C6.00002 5.44891 5.921 5.63968 5.78035 5.78033C5.6397 5.92098 5.44893 6 5.25002 6H1.50002V13.5H12V1.5H6.00002Z"],
  "file-list-3": ["0 0 15 15", "M12.75 15H2.25C1.65326 15 1.08097 14.7629 0.65901 14.341C0.237053 13.919 0 13.3467 0 12.75V0.75C0 0.551088 0.0790176 0.360322 0.21967 0.21967C0.360322 0.0790176 0.551088 0 0.75 0H11.25C11.4489 0 11.6397 0.0790176 11.7803 0.21967C11.921 0.360322 12 0.551088 12 0.75V9.75H15V12.75C15 13.3467 14.7629 13.919 14.341 14.341C13.919 14.7629 13.3467 15 12.75 15ZM12 11.25V12.75C12 12.9489 12.079 13.1397 12.2197 13.2803C12.3603 13.421 12.5511 13.5 12.75 13.5C12.9489 13.5 13.1397 13.421 13.2803 13.2803C13.421 13.1397 13.5 12.9489 13.5 12.75V11.25H12ZM10.5 13.5V1.5H1.5V12.75C1.5 12.9489 1.57902 13.1397 1.71967 13.2803C1.86032 13.421 2.05109 13.5 2.25 13.5H10.5ZM3 3.75H9V5.25H3V3.75ZM3 6.75H9V8.25H3V6.75ZM3 9.75H6.75V11.25H3V9.75Z"],
  "folder-open": ["0 0 15.375 13.5", "M0.75 13.5C0.551088 13.5 0.360322 13.421 0.21967 13.2803C0.0790176 13.1397 0 12.9489 0 12.75V0.75C0 0.551088 0.0790176 0.360322 0.21967 0.21967C0.360322 0.0790176 0.551088 0 0.75 0H6.3105L7.8105 1.5H13.5C13.6989 1.5 13.8897 1.57902 14.0303 1.71967C14.171 1.86032 14.25 2.05109 14.25 2.25V4.5H12.75V3H7.1895L5.6895 1.5H1.5V10.4985L2.625 6H15.375L13.6425 12.9323C13.6019 13.0944 13.5082 13.2384 13.3764 13.3413C13.2446 13.4441 13.0822 13.5 12.915 13.5H0.75V13.5ZM13.4535 7.5H3.7965L2.6715 12H12.3285L13.4535 7.5Z"],
  "gift-2": ["0 0 15 15.0026", "M9.375 0.00256638C9.81799 0.00241488 10.2538 0.114373 10.6419 0.328013C11.0299 0.541654 11.3576 0.850028 11.5944 1.22442C11.8312 1.5988 11.9694 2.02703 11.9961 2.46921C12.0228 2.91139 11.9372 3.35314 11.7473 3.75332L14.25 3.75257C14.4489 3.75257 14.6397 3.83158 14.7803 3.97224C14.921 4.11289 15 4.30365 15 4.50257V7.50257C15 7.70148 14.921 7.89224 14.7803 8.0329C14.6397 8.17355 14.4489 8.25257 14.25 8.25257H13.5V14.2526C13.5 14.4515 13.421 14.6422 13.2803 14.7829C13.1397 14.9236 12.9489 15.0026 12.75 15.0026H2.25C2.05109 15.0026 1.86032 14.9236 1.71967 14.7829C1.57902 14.6422 1.5 14.4515 1.5 14.2526V8.25257H0.75C0.551088 8.25257 0.360322 8.17355 0.21967 8.0329C0.0790176 7.89224 0 7.70148 0 7.50257V4.50257C0 4.30365 0.0790176 4.11289 0.21967 3.97224C0.360322 3.83158 0.551088 3.75257 0.75 3.75257L3.25275 3.75332C2.98557 3.19207 2.92622 2.55422 3.08528 1.95332C3.24433 1.35241 3.61147 0.827449 4.12132 0.471881C4.63118 0.116312 5.25068 -0.0467872 5.86952 0.011617C6.48837 0.0700213 7.06642 0.346139 7.50075 0.790816C7.74453 0.540711 8.03602 0.342075 8.35796 0.206676C8.6799 0.0712776 9.02575 0.00187047 9.375 0.00256638V0.00256638ZM12 8.25257H3V13.5026H12V8.25257ZM13.5 5.25257H1.5V6.75257H13.5V5.25257ZM5.625 1.50257C5.33609 1.50271 5.0583 1.614 4.84921 1.81337C4.64012 2.01275 4.51574 2.28492 4.50186 2.5735C4.48797 2.86208 4.58564 3.14494 4.77463 3.36347C4.96362 3.582 5.22944 3.71944 5.517 3.74732L5.625 3.75257H6.75V2.62757C6.74999 2.3479 6.64581 2.07827 6.45779 1.87125C6.26976 1.66423 6.01137 1.53466 5.733 1.50782L5.625 1.50257ZM9.375 1.50257L9.267 1.50782C9.00703 1.53272 8.76383 1.6473 8.57909 1.8319C8.39436 2.0165 8.2796 2.25962 8.2545 2.51957L8.25 2.62757V3.75257H9.375L9.483 3.74732C9.76127 3.72034 10.0195 3.59071 10.2074 3.38371C10.3953 3.1767 10.4994 2.90714 10.4994 2.62757C10.4994 2.34799 10.3953 2.07843 10.2074 1.87143C10.0195 1.66442 9.76127 1.53479 9.483 1.50782L9.375 1.50257Z"],
  "graduation-cap": ["0 0 15 12.5", "M2.5 5.83331L0 4.375L7.5 0L15 4.375V9.6875H13.75V5.10419L12.5 5.83331V10.0071L12.3609 10.179C11.2161 11.5937 9.46362 12.5 7.5 12.5C5.53636 12.5 3.78393 11.5937 2.63914 10.179L2.5 10.0071V5.83331ZM3.75 6.5625V9.55731C4.66701 10.5963 6.00695 11.25 7.5 11.25C8.99306 11.25 10.333 10.5963 11.25 9.55731V6.5625L7.5 8.75L3.75 6.5625ZM2.48079 4.375L7.5 7.30287L12.5192 4.375L7.5 1.44713L2.48079 4.375Z"],
  "headphone": ["0 0 15 14.25", "M7.5 1.5C5.9087 1.5 4.38258 2.13214 3.25736 3.25736C2.13214 4.38258 1.5 5.9087 1.5 7.5H3.75C4.14782 7.5 4.52936 7.65804 4.81066 7.93934C5.09196 8.22064 5.25 8.60218 5.25 9V12.75C5.25 13.1478 5.09196 13.5294 4.81066 13.8107C4.52936 14.092 4.14782 14.25 3.75 14.25H1.5C1.10218 14.25 0.720644 14.092 0.43934 13.8107C0.158035 13.5294 0 13.1478 0 12.75V7.5C0 3.35775 3.35775 0 7.5 0C11.6422 0 15 3.35775 15 7.5V12.75C15 13.1478 14.842 13.5294 14.5607 13.8107C14.2794 14.092 13.8978 14.25 13.5 14.25H11.25C10.8522 14.25 10.4706 14.092 10.1893 13.8107C9.90804 13.5294 9.75 13.1478 9.75 12.75V9C9.75 8.60218 9.90804 8.22064 10.1893 7.93934C10.4706 7.65804 10.8522 7.5 11.25 7.5H13.5C13.5 5.9087 12.8679 4.38258 11.7426 3.25736C10.6174 2.13214 9.0913 1.5 7.5 1.5V1.5ZM1.5 9V12.75H3.75V9H1.5ZM11.25 9V12.75H13.5V9H11.25Z"],
  "image-circle": ["0 0 12.5 12.5", "M10.9851 7.86025L8.56669 5.44187C8.32263 5.19775 7.92687 5.19775 7.68281 5.44187L3.04053 10.0841C1.94599 9.16694 1.25 7.78975 1.25 6.25C1.25 3.48857 3.48857 1.25 6.25 1.25C9.01144 1.25 11.25 3.48857 11.25 6.25C11.25 6.81338 11.1568 7.35494 10.9851 7.86025ZM4.11829 10.7741L8.12475 6.76769L10.3987 9.04163C9.4995 10.3752 7.97581 11.2499 6.24975 11.2499C5.48656 11.2499 4.76466 11.0792 4.11829 10.7741ZM6.25 12.5C9.70175 12.5 12.5 9.70175 12.5 6.25C12.5 2.79822 9.70175 0 6.25 0C2.79822 0 0 2.79822 0 6.25C0 9.70175 2.79822 12.5 6.25 12.5ZM5.625 5C5.625 5.69037 5.06537 6.25 4.375 6.25C3.68464 6.25 3.125 5.69037 3.125 5C3.125 4.30964 3.68464 3.75 4.375 3.75C5.06537 3.75 5.625 4.30964 5.625 5Z"],
  "list-unordered": ["0 0 13.5 12.675", "M3.75 0.375H13.5V1.875H3.75V0.375ZM1.125 2.25C0.826632 2.25 0.540483 2.13147 0.329505 1.9205C0.118526 1.70952 0 1.42337 0 1.125C0 0.826631 0.118526 0.540483 0.329505 0.329505C0.540483 0.118526 0.826632 0 1.125 0C1.42337 0 1.70952 0.118526 1.9205 0.329505C2.13147 0.540483 2.25 0.826631 2.25 1.125C2.25 1.42337 2.13147 1.70952 1.9205 1.9205C1.70952 2.13147 1.42337 2.25 1.125 2.25ZM1.125 7.5C0.826632 7.5 0.540483 7.38147 0.329505 7.1705C0.118526 6.95952 0 6.67337 0 6.375C0 6.07663 0.118526 5.79048 0.329505 5.5795C0.540483 5.36853 0.826632 5.25 1.125 5.25C1.42337 5.25 1.70952 5.36853 1.9205 5.5795C2.13147 5.79048 2.25 6.07663 2.25 6.375C2.25 6.67337 2.13147 6.95952 1.9205 7.1705C1.70952 7.38147 1.42337 7.5 1.125 7.5ZM1.125 12.675C0.826632 12.675 0.540483 12.5565 0.329505 12.3455C0.118526 12.1345 0 11.8484 0 11.55C0 11.2516 0.118526 10.9655 0.329505 10.7545C0.540483 10.5435 0.826632 10.425 1.125 10.425C1.42337 10.425 1.70952 10.5435 1.9205 10.7545C2.13147 10.9655 2.25 11.2516 2.25 11.55C2.25 11.8484 2.13147 12.1345 1.9205 12.3455C1.70952 12.5565 1.42337 12.675 1.125 12.675ZM3.75 5.625H13.5V7.125H3.75V5.625ZM3.75 10.875H13.5V12.375H3.75V10.875Z"],
  "mail-star": ["0 0 16.335 15.1058", "M15 7.5H13.5V3.1785L7.554 8.5035L1.5 3.162V12H9V13.5H0.75C0.551088 13.5 0.360322 13.421 0.21967 13.2803C0.0790176 13.1397 0 12.9489 0 12.75V0.75C0 0.551088 0.0790176 0.360322 0.21967 0.21967C0.360322 0.0790176 0.551088 0 0.75 0H14.25C14.4489 0 14.6397 0.0790176 14.7803 0.21967C14.921 0.360322 15 0.551088 15 0.75V7.5ZM1.88325 1.5L7.54575 6.4965L13.1265 1.5H1.88325ZM13.125 14.0625L11.1412 15.105L11.52 12.8962L9.915 11.3317L12.1328 11.0093L13.125 9L14.1172 11.01L16.335 11.3325L14.73 12.8962L15.1088 15.1058L13.125 14.0625Z"],
  "menu-4": ["0 0 13.5 12", "M9.75 10.5V12H1.5V10.5H9.75ZM13.5 5.25V6.75H0V5.25H13.5ZM12 0V1.5H3.75V0H12Z"],
  "reserved": ["0 0 13.5 13.5", "M7.5 9V12H9.75V13.5H3.75V12H6V9H0.75C0.551088 9 0.360322 8.92098 0.21967 8.78033C0.0790176 8.63968 0 8.44891 0 8.25V0.75C0 0.551088 0.0790176 0.360322 0.21967 0.21967C0.360322 0.0790176 0.551088 0 0.75 0H12.75C12.9489 0 13.1397 0.0790176 13.2803 0.21967C13.421 0.360322 13.5 0.551088 13.5 0.75V8.25C13.5 8.44891 13.421 8.63968 13.2803 8.78033C13.1397 8.92098 12.9489 9 12.75 9H7.5ZM1.5 7.5H12V1.5H1.5V7.5ZM3.75 3.75H9.75V5.25H3.75V3.75Z"],
  "settings-3": ["0 0 14.457 15.0027", "M0.7335 11.2513C0.416453 10.7031 0.169999 10.1169 0 9.50683C0.36998 9.31866 0.680696 9.0318 0.897772 8.678C1.11485 8.3242 1.22982 7.91725 1.22998 7.50217C1.23013 7.08708 1.11546 6.68004 0.898652 6.32608C0.68184 5.97212 0.37134 5.68503 0.00150007 5.49658C0.340527 4.2707 0.986047 3.1513 1.87725 2.24383C2.22532 2.47013 2.62921 2.5957 3.04423 2.60667C3.45925 2.61763 3.86921 2.51356 4.22875 2.30596C4.58828 2.09836 4.88336 1.79533 5.08134 1.43041C5.27932 1.06549 5.37248 0.652914 5.3505 0.238332C6.58208 -0.0799514 7.87442 -0.0794351 9.10575 0.239832C9.08396 0.654406 9.1773 1.06692 9.37543 1.43174C9.57357 1.79655 9.86877 2.09944 10.2284 2.30688C10.588 2.51432 10.998 2.61822 11.413 2.6071C11.828 2.59597 12.2318 2.47024 12.5797 2.24383C13.014 2.68633 13.3995 3.18958 13.7235 3.75133C14.0482 4.31308 14.2912 4.89883 14.457 5.49583C14.087 5.68401 13.7763 5.97086 13.5592 6.32466C13.3422 6.67846 13.2272 7.08541 13.227 7.5005C13.2269 7.91558 13.3415 8.32262 13.5583 8.67658C13.7752 9.03054 14.0857 9.31763 14.4555 9.50608C14.1165 10.732 13.471 11.8514 12.5797 12.7588C12.2317 12.5325 11.8278 12.407 11.4128 12.396C10.9977 12.385 10.5878 12.4891 10.2283 12.6967C9.86872 12.9043 9.57363 13.2073 9.37565 13.5723C9.17767 13.9372 9.08452 14.3497 9.1065 14.7643C7.87492 15.0826 6.58258 15.0821 5.35125 14.7628C5.37303 14.3483 5.2797 13.9357 5.08157 13.5709C4.88343 13.2061 4.58823 12.9032 4.22863 12.6958C3.86903 12.4883 3.45904 12.3844 3.04404 12.3956C2.62905 12.4067 2.22522 12.5324 1.87725 12.7588C1.43399 12.3065 1.0497 11.8 0.7335 11.2513V11.2513ZM4.9785 11.3983C5.77772 11.8593 6.37863 12.5991 6.666 13.4758C7.04025 13.5111 7.416 13.5118 7.79025 13.4766C8.0778 12.5997 8.679 11.8599 9.4785 11.3991C10.2774 10.9368 11.2189 10.7859 12.1222 10.9753C12.3397 10.6693 12.5272 10.3431 12.6832 10.0018C12.0678 9.31441 11.7278 8.42399 11.7285 7.50133C11.7285 6.55633 12.081 5.67358 12.6832 5.00083C12.5261 4.65969 12.3378 4.33381 12.1207 4.02733C11.218 4.21656 10.2771 4.06594 9.4785 3.60433C8.67928 3.14336 8.07837 2.40357 7.791 1.52683C7.41675 1.49158 7.041 1.49083 6.66675 1.52608C6.3792 2.40294 5.778 3.14275 4.9785 3.60358C4.17959 4.06582 3.23811 4.21672 2.33475 4.02733C2.11767 4.33355 1.92985 4.65948 1.77375 5.00083C2.38918 5.68825 2.72916 6.57867 2.7285 7.50133C2.7285 8.44633 2.376 9.32908 1.77375 10.0018C1.93085 10.343 2.11915 10.6689 2.33625 10.9753C3.23904 10.7861 4.17991 10.9367 4.9785 11.3983ZM7.2285 9.75133C6.63176 9.75133 6.05947 9.51428 5.63751 9.09232C5.21555 8.67037 4.9785 8.09807 4.9785 7.50133C4.9785 6.90459 5.21555 6.3323 5.63751 5.91034C6.05947 5.48838 6.63176 5.25133 7.2285 5.25133C7.82524 5.25133 8.39753 5.48838 8.81949 5.91034C9.24145 6.3323 9.4785 6.90459 9.4785 7.50133C9.4785 8.09807 9.24145 8.67037 8.81949 9.09232C8.39753 9.51428 7.82524 9.75133 7.2285 9.75133ZM7.2285 8.25133C7.42741 8.25133 7.61818 8.17231 7.75883 8.03166C7.89948 7.89101 7.9785 7.70024 7.9785 7.50133C7.9785 7.30242 7.89948 7.11165 7.75883 6.971C7.61818 6.83035 7.42741 6.75133 7.2285 6.75133C7.02959 6.75133 6.83882 6.83035 6.69817 6.971C6.55752 7.11165 6.4785 7.30242 6.4785 7.50133C6.4785 7.70024 6.55752 7.89101 6.69817 8.03166C6.83882 8.17231 7.02959 8.25133 7.2285 8.25133V8.25133Z"],
  "settings-6": ["0 0 16.5 14.289", "M12.375 0L16.5 7.1445L12.375 14.289H4.125L0 7.1445L4.125 0H12.375ZM11.5087 1.5H4.99125L1.73175 7.1445L4.99125 12.789H11.5087L14.7682 7.1445L11.5087 1.5ZM5.7255 4.272L7.0245 3.522L10.7745 10.017L9.4755 10.767L5.7255 4.272V4.272Z"],
  "swap-3": ["0 0 12.1339 12.3927", "M2.31694 2.39276L0.883881 3.82582L0 2.94194L2.94194 0L5.88389 2.94194L5.00002 3.82582L3.56694 2.39276L3.56694 5.57136H2.31694V2.39276ZM9.19196 4.63388C10.0549 4.63388 10.7545 3.93433 10.7545 3.07138C10.7545 2.20844 10.0549 1.50888 9.19196 1.50888C8.32902 1.50888 7.62946 2.20844 7.62946 3.07138C7.62946 3.93433 8.32902 4.63388 9.19196 4.63388ZM9.19196 5.88386C7.63864 5.88386 6.37946 4.62468 6.37946 3.07138C6.37946 1.51808 7.63864 0.258881 9.19196 0.258881C10.7453 0.258881 12.0045 1.51808 12.0045 3.07138C12.0045 4.62468 10.7453 5.88386 9.19196 5.88386ZM12.1339 9.4508L11.25 8.56692L9.81695 9.99999V6.82136H8.56696V9.99999L7.13389 8.56692L6.25002 9.4508L9.19196 12.3927L12.1339 9.4508ZM1.69194 10.5714H4.19194L4.19194 8.07136H1.69194V10.5714ZM4.81696 6.82136C5.16214 6.82136 5.44196 7.10117 5.44196 7.44636V11.1964C5.44196 11.5416 5.16214 11.8214 4.81696 11.8214H1.06694C0.721763 11.8214 0.441938 11.5416 0.441944 11.1964V7.44636C0.441944 7.10117 0.721763 6.82136 1.06694 6.82136H4.81696Z"],
  "user-6": ["0 0 12.9098 14.847", "M6.4545 11.25C9.201 11.25 11.6033 12.4312 12.9098 14.1937L11.5282 14.847C10.4647 13.587 8.58975 12.75 6.4545 12.75C4.31925 12.75 2.44425 13.587 1.38075 14.847L0 14.193C1.3065 12.4305 3.708 11.25 6.4545 11.25ZM6.4545 0C7.44906 0 8.40289 0.395088 9.10615 1.09835C9.80941 1.80161 10.2045 2.75544 10.2045 3.75V6C10.2044 6.96635 9.83134 7.89537 9.16301 8.59333C8.49467 9.29129 7.58269 9.70431 6.61725 9.74625L6.4545 9.75C5.45994 9.75 4.50611 9.35491 3.80285 8.65165C3.09959 7.94839 2.7045 6.99456 2.7045 6V3.75C2.70456 2.78365 3.07766 1.85463 3.74599 1.15667C4.41433 0.458705 5.32631 0.0456896 6.29175 0.00375009L6.4545 0ZM6.4545 1.5C5.88059 1.49997 5.32836 1.71924 4.9108 2.11296C4.49324 2.50668 4.24192 3.04508 4.20825 3.618L4.2045 3.75V6C4.20394 6.58568 4.43176 7.1485 4.83958 7.56886C5.24739 7.98923 5.80305 8.23401 6.38847 8.2512C6.9739 8.26839 7.54296 8.05662 7.97473 7.6609C8.4065 7.26519 8.66695 6.7167 8.70075 6.132L8.7045 6V3.75C8.7045 3.15326 8.46745 2.58097 8.04549 2.15901C7.62353 1.73705 7.05124 1.5 6.4545 1.5V1.5Z"],
  "wallet": ["0 0 15 13.5", "M12 3H14.25C14.4489 3 14.6397 3.07902 14.7803 3.21967C14.921 3.36032 15 3.55109 15 3.75V12.75C15 12.9489 14.921 13.1397 14.7803 13.2803C14.6397 13.421 14.4489 13.5 14.25 13.5H0.75C0.551088 13.5 0.360322 13.421 0.21967 13.2803C0.0790176 13.1397 0 12.9489 0 12.75V0.75C0 0.551088 0.0790176 0.360322 0.21967 0.21967C0.360322 0.0790176 0.551088 0 0.75 0H12V3ZM1.5 4.5V12H13.5V4.5H1.5ZM1.5 1.5V3H10.5V1.5H1.5ZM9.75 7.5H12V9H9.75V7.5Z"],
};

type IconBox = { name: string; inset: string };
type SubItem = { id: string; label: string; icon: IconBox };
type SectionId = "dashboard" | "profile" | "resources" | "settings";
type MainItem = { id: SectionId; label: string; radius: number; icon: IconBox; elevated?: boolean; subItems: SubItem[] };

const MAIN_ITEMS: MainItem[] = [
  {
    id: "dashboard", label: "Dashboard", radius: 16, icon: { name: "dashboard-horizontal", inset: "18.75% 18.75% 18.75% 18.75%" },
    subItems: [
      { id: "collection", label: "Collection", icon: { name: "coins", inset: "12.5% 12.49% 12.51% 12.51%" } },
      { id: "token", label: "Token", icon: { name: "coin", inset: "20% 8.75% 20% 8.75%" } },
      { id: "rewards", label: "Rewards", icon: { name: "gift-2", inset: "12.49% 12.5% 12.5% 12.5%" } },
      { id: "swap", label: "Swap", icon: { name: "swap-3", inset: "19.02% 19.67% 19.02% 19.67%" } },
    ],
  },
  {
    id: "profile", label: "Profile", radius: 24, elevated: true, icon: { name: "user-6", inset: "12.5% 17.72% 13.26% 17.73%" },
    subItems: [
      { id: "galleries", label: "Galleries", icon: { name: "image-circle", inset: "18.75% 18.75% 18.75% 18.75%" } },
      { id: "items", label: "Items", icon: { name: "collage", inset: "16.25% 16.25% 16.25% 16.25%" } },
      { id: "portfolio", label: "Portfolio", icon: { name: "folder-open", inset: "16.25% 10.62% 16.25% 12.5%" } },
      { id: "listings", label: "Listings", icon: { name: "list-unordered", inset: "18.12% 16.25% 18.5% 16.25%" } },
    ],
  },
  {
    id: "resources", label: "Resources", radius: 6, icon: { name: "reserved", inset: "16.25% 16.25% 16.25% 16.25%" },
    subItems: [
      { id: "learn", label: "Learn", icon: { name: "file", inset: "12.5% 16.25% 12.5% 16.25%" } },
      { id: "help-center", label: "Help center", icon: { name: "headphone", inset: "12.5% 12.5% 16.25% 12.5%" } },
      { id: "blog", label: "Blog", icon: { name: "file-list-3", inset: "12.5% 12.5% 12.5% 12.5%" } },
      { id: "careers", label: "Careers", icon: { name: "graduation-cap", inset: "18.75% 12.5% 18.75% 12.5%" } },
    ],
  },
  {
    id: "settings", label: "Settings", radius: 6, icon: { name: "settings-3", inset: "12.49% 13.86% 12.49% 13.86%" },
    subItems: [
      { id: "settings-profile", label: "Profile", icon: { name: "user-6", inset: "12.5% 17.72% 13.26% 17.73%" } },
      { id: "linked-wallets", label: "Linked wallets", icon: { name: "wallet", inset: "16.25% 12.5% 16.25% 12.5%" } },
      { id: "email", label: "Email", icon: { name: "mail-star", inset: "16.25% 5.82% 8.22% 12.5%" } },
      { id: "customize", label: "Customize", icon: { name: "settings-6", inset: "14.28% 8.75% 14.28% 8.75%" } },
    ],
  },
];

function Icon({ box }: { box: IconBox }) {
  const [vb, d] = ICONS[box.name];
  return (
    <span className="menu-icon" aria-hidden="true">
      <span style={{ inset: box.inset }}>
        <svg viewBox={vb} preserveAspectRatio="none" fill="currentColor"><path d={d} /></svg>
      </span>
    </span>
  );
}

function Chevron() {
  return (
    <span className="menu-chevron" aria-hidden="true">
      <Icon box={{ name: "arrow-down-s", inset: "35.83% 26.13% 35% 26.14%" }} />
    </span>
  );
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const CSS = `
.menu-root { --menu-dur: 320ms; --menu-ease: ${EASE}; }
.menu-scaler { transition: transform var(--menu-dur) var(--menu-ease); transform-origin: center; }
.menu-wrapper { position: relative; display: inline-block; }
.menu-card {
  position: relative; width: 244px; height: 46px; border: 0; outline: 0; cursor: pointer;
  background: linear-gradient(180deg,#2b2d2b,#242624); border-radius: 999px; padding: 10px;
  box-sizing: border-box; text-align: left; overflow: hidden; color: #c2cbc4;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4);
  transition: width var(--menu-dur) var(--menu-ease), height var(--menu-dur) var(--menu-ease),
    border-radius var(--menu-dur) var(--menu-ease), padding var(--menu-dur) var(--menu-ease),
    box-shadow var(--menu-dur) var(--menu-ease), transform 150ms ${EASE};
  will-change: width, height;
}
.menu-card:active { transform: scale(0.98); }
.menu-card:focus-visible { box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 0 0 3px rgba(52,181,98,.55); }
.menu-card.is-open {
  height: calc(183px + var(--open-count, 0) * 152px); border-radius: 20px; padding: 12px; cursor: default;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 12px 28px -10px rgba(0,0,0,.55);
}
.menu-card.is-open:active { transform: none; }
.menu-layer { position: absolute; inset: 0; display: flex; box-sizing: border-box; }
.menu-layer--collapsed { align-items: center; justify-content: center; gap: 4px; padding: 10px; opacity: 1; filter: blur(0);
  transition: opacity 140ms ease-out, filter 140ms ease-out; color: #8b968f; }
.menu-card.is-open .menu-layer--collapsed { opacity: 0; filter: blur(2px); pointer-events: none; transition: opacity 100ms ease-out, filter 100ms ease-out; }
.menu-layer--expanded { flex-direction: column; gap: 10px; padding: 12px; list-style: none; margin: 0; pointer-events: none; }
.menu-card.is-open .menu-layer--expanded { pointer-events: auto; }
.menu-layer--expanded > li { list-style: none; width: 100%; }
.menu-row {
  display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 32px; padding: 4px;
  box-sizing: border-box; overflow: hidden; flex-shrink: 0; color: #8b968f;
  opacity: 0; transform: translateY(8px); filter: blur(2px);
  transition: opacity 120ms ease-out, transform 120ms ease-out, filter 120ms ease-out, background-color 150ms ease-out; transition-delay: 0ms;
}
.menu-card.is-open .menu-row {
  opacity: 1; transform: translateY(0); filter: blur(0);
  transition: opacity 360ms ${EASE}, transform 360ms ${EASE}, filter 360ms ${EASE}, background-color 150ms ease-out;
}
.menu-card.is-open .menu-row[data-row='dashboard'] { transition-delay: 140ms, 140ms, 140ms, 0ms; }
.menu-card.is-open .menu-row[data-row='profile']   { transition-delay: 200ms, 200ms, 200ms, 0ms; }
.menu-card.is-open .menu-row[data-row='resources'] { transition-delay: 260ms, 260ms, 260ms, 0ms; }
.menu-card.is-open .menu-row[data-row='settings']  { transition-delay: 320ms, 320ms, 320ms, 0ms; }
.menu-row { cursor: pointer; }
.menu-row:hover { background-color: rgba(255,255,255,.04); }
.menu-row:focus-visible { outline: 2px solid rgba(52,181,98,.6); outline-offset: -2px; }
.menu-row__group { display: flex; align-items: center; gap: 6px; }
.menu-row__label, .menu-collapsed__label, .menu-sub__label { font-size: 14px; line-height: 20px; font-weight: 500; letter-spacing: -0.084px; white-space: nowrap; }
.menu-row__label, .menu-sub__label { color: #e3e8e3; }
.menu-collapsed__label { color: #c2cbc4; padding: 0 4px; }
.menu-icon { position: relative; display: block; width: 20px; height: 20px; overflow: hidden; flex-shrink: 0; }
.menu-icon > span { position: absolute; }
.menu-icon svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.menu-chevron { display: inline-flex; align-items: center; justify-content: center; color: #5d6862; transition: transform var(--menu-dur) var(--menu-ease); }
.menu-section[data-state='open'] > .menu-row .menu-chevron { transform: rotate(180deg); }
.menu-section { display: flex; flex-direction: column; width: 100%; }
.menu-sub {
  display: flex; flex-direction: column; align-items: stretch; gap: 10px; padding: 0 26px; width: 100%; height: 0; margin-top: 0;
  overflow: hidden; box-sizing: border-box; position: relative;
  transition: height var(--menu-dur) var(--menu-ease), margin-top var(--menu-dur) var(--menu-ease);
}
.menu-sub::before { content: ''; position: absolute; left: 14px; top: 0; bottom: 14px; width: 1px; background: rgba(255,255,255,.1); border-radius: 1px; pointer-events: none; }
.menu-section[data-state='open'] .menu-sub { height: 142px; margin-top: 10px; }
.menu-sub__row {
  display: flex; align-items: center; gap: 6px; padding: 4px; border-radius: 16px; flex-shrink: 0; height: 28px; box-sizing: border-box; position: relative;
  color: #8b968f; opacity: 0; transform: translateY(6px); filter: blur(2px);
  transition: opacity 120ms ease-out, transform 120ms ease-out, filter 120ms ease-out; transition-delay: 0ms;
}
.menu-sub__row::before { content: ''; position: absolute; right: 100%; top: 50%; width: 12px; height: 1px; background: rgba(255,255,255,.1); border-radius: 1px; pointer-events: none; }
.menu-section[data-state='open'] .menu-sub__row { opacity: 1; transform: translateY(0); filter: blur(0); transition: opacity 320ms ${EASE}, transform 320ms ${EASE}, filter 320ms ${EASE}; }
.menu-section[data-state='open'] .menu-sub__row:nth-child(1) { transition-delay: 120ms; }
.menu-section[data-state='open'] .menu-sub__row:nth-child(2) { transition-delay: 170ms; }
.menu-section[data-state='open'] .menu-sub__row:nth-child(3) { transition-delay: 220ms; }
.menu-section[data-state='open'] .menu-sub__row:nth-child(4) { transition-delay: 270ms; }
.menu-close {
  position: absolute; top: -10px; right: -10px; width: 28px; height: 28px; border-radius: 999px; border: 0; padding: 0;
  background: linear-gradient(180deg,#323532,#2b2d2b); cursor: pointer; display: grid; place-items: center; color: #8b968f; z-index: 2;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(0,0,0,.6), 0 2px 6px rgba(0,0,0,.45);
  opacity: 0; transform: scale(0.6); pointer-events: none;
  transition: opacity 200ms ease-out, transform 220ms cubic-bezier(0.34, 1.36, 0.64, 1), box-shadow 150ms ease-out, color 150ms ease-out;
}
.menu-wrapper.is-open .menu-close { opacity: 1; transform: scale(1); pointer-events: auto; transition-delay: 180ms; }
.menu-close:hover { color: #e3e8e3; }
.menu-close:active { transform: scale(0.92); transition-duration: 80ms; }
.menu-close:focus-visible { outline: 2px solid rgba(52,181,98,.6); outline-offset: 2px; }
.menu-close svg { width: 14px; height: 14px; display: block; }
@media (prefers-reduced-motion: reduce) {
  .menu-scaler, .menu-close, .menu-card, .menu-layer--collapsed, .menu-card.is-open .menu-layer--collapsed, .menu-row, .menu-card.is-open .menu-row,
  .menu-sub, .menu-sub__row, .menu-section[data-state='open'] .menu-sub__row, .menu-chevron { transition: none !important; }
}`;

function useBox(ref: React.RefObject<HTMLDivElement | null>) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([en]) => setBox({ w: en.contentRect.width, h: en.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return box;
}

export default function Menu({ size = "card" }: { size?: "card" | "big" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useBox(rootRef);
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<Set<SectionId>>(new Set());

  const toggle = (id: SectionId, ev: MouseEvent | React.KeyboardEvent) => {
    ev.stopPropagation();
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const closeAll = (ev: MouseEvent) => {
    ev.stopPropagation();
    setSections(new Set());
    setOpen(false);
  };

  // fit: the card's target height (+ the close chip's 10px overhang) must stay inside the box
  const base = size === "big" ? 1.6 : 1;
  const target = (open ? 183 + sections.size * 152 : 46) + 20;
  const scale = box.h ? Math.min(base, (box.h - 12) / target) : base;

  return (
    <div ref={rootRef} className="menu-root" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <div className="menu-scaler" style={{ transform: `scale(${scale})` }}>
        <div data-own-click className={`menu-wrapper ${open ? "is-open" : ""}`} style={{ pointerEvents: "auto" }}>
          <div
            className={`menu-card ${open ? "is-open" : ""}`}
            style={{ ["--open-count" as string]: sections.size } as CSSProperties}
            onClick={() => { if (!open) setOpen(true); }}
            role={open ? undefined : "button"}
            tabIndex={open ? -1 : 0}
            aria-expanded={open}
            aria-label={open ? "Menu" : "Open menu"}
            onKeyDown={(ev) => {
              if (!open && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); setOpen(true); }
              if (open && ev.key === "Escape") { setSections(new Set()); setOpen(false); }
            }}
          >
            <div className="menu-layer menu-layer--collapsed">
              <Icon box={{ name: "menu-4", inset: "20% 16.25% 20% 16.25%" }} />
              <span className="menu-collapsed__label">Menu</span>
            </div>
            <ul className="menu-layer menu-layer--expanded">
              {MAIN_ITEMS.map((item) => {
                const isOpen = sections.has(item.id);
                return (
                  <li key={item.id} className="menu-section" data-state={isOpen ? "open" : "closed"}>
                    <div
                      className="menu-row"
                      data-row={item.id}
                      style={{ borderRadius: item.radius }}
                      role="button"
                      tabIndex={open ? 0 : -1}
                      aria-expanded={isOpen}
                      onClick={(ev) => toggle(item.id, ev)}
                      onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); toggle(item.id, ev); } }}
                    >
                      <span className="menu-row__group">
                        <Icon box={item.icon} />
                        <span className="menu-row__label">{item.label}</span>
                      </span>
                      <Chevron />
                    </div>
                    <div className="menu-sub" role="region" aria-label={`${item.label} sub-menu`}>
                      {item.subItems.map((sub) => (
                        <div key={sub.id} className="menu-sub__row">
                          <Icon box={sub.icon} />
                          <span className="menu-sub__label">{sub.label}</span>
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <button type="button" className="menu-close" onClick={closeAll} aria-label="Close menu" tabIndex={open ? 0 : -1}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
