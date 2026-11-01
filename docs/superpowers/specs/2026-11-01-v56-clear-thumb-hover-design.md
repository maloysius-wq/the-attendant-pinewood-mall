# The Call v56: Visually Clear Thumb Hover

Max's Android v55 screenshot shows the terminal thumb flesh planted over the lower-right CHECK IN button before the tap. The previous v55 regression verified 35mm physical depth and zero glass penetration, but **264/524 distal source-skin vertices still projected onto the button at rest**. The underlying source distal joint is anchored at x=+0.086, *inside* the display's x=+0.109 boundary, so only lifting the terminal vertex in Z/Y cannot remove the overlap.

Keep the exact native, continuous CC0 MakeHuman right forearm with 163 bones, hand scale 2.4x, same phone and production isolation. Reject overlay/proxy thumbs, reverting to a smaller hand, or moving the entire wrist during the tap.

Preferred fix: move the **static grip** outward along the right side, let a constrained terminal thumb joint reach into CHECK IN only for the tap, and require a visually clear idle button. If a static thumb middle-joint pre-pose is essential, it may be set once before the animation, but should not animate as the tip presses. The real skin must never enter the phone solid. Reject any candidate that cannot simultaneously clear the resting button and touch it with the real fleshy fingertip. Capture mobile hover/press/release and phone-hidden anatomy; preserve the full opening and Android portrait controls.

Behavioral acceptance:
- Hover: at most 10 distal skin vertices and 25 total thumb-influenced vertices project within the CHECK IN button, a steep reduction from 264.
- Press: authentic fleshy source vertices touch inside the button with minimum depth z=[+.0249,+.034] and at least 10 distal button vertices.
- All samples: no skin enters the phone casing; root and proximal thumb joints remain static during tap, distal joint visibly moves and returns.
- Original 2.4x scale and right-hand continuity remain; root index.html/game.js untouched.
