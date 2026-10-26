# Gully v12: the pulled-back city street (Figma 168:191), done without warping.
# The painting is scaled evenly to the screen width. It is a little short for a phone, so plain
# square-and-pavement rows are repeated in the middle (each copy lined up so the pavement edges run on
# straight) - nothing is stretched. The open square is repainted one flat sand colour so the code
# field/kerb sit on it cleanly; the street mouth lands just above the far kerb.
import cv2, numpy as np, sys
SRC = cv2.imread('src.png'); BIG = cv2.imread(sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/sp/g12_x4.png')
sh, sw = SRC.shape[:2]
OW, OH = 1170, 2532
HS = int(round(sw * OH / OW))            # canvas height in src px (768 wide)
MOUTH, TOP = 612, 0.262                  # where the street opens into the square -> just above the oval top
C = int(MOUTH - TOP * HS)                # rows cropped off the top (sky)
SPLIT, B0, B1 = 1000, 950, 1000          # repeat rows B0..B1 (clean square + pavement) at row SPLIT
INS = HS - (SPLIT - C) - (sh - SPLIT)

hsv = cv2.cvtColor(SRC, cv2.COLOR_BGR2HSV)
sand = (hsv[..., 0] >= 8) & (hsv[..., 0] <= 22) & (hsv[..., 1] >= 110) & (hsv[..., 2] >= 200)
def edges(y):
    r = np.nonzero(sand[y, :384])[0]; l = np.nonzero(sand[y, 384:])[0]
    return r.min(), 384 + l.max()

big = BIG.astype(np.float32); K = 4
def rows(a, b): return big[a * K:b * K]
# block to repeat: each row shifted so its pavement edges line up with row B1's
blk = rows(B0, B1).copy(); xl1, xr1 = edges(B1 - 1)
for y in range(B0, B1):
    xl, xr = edges(y); r = blk[(y - B0) * K:(y - B0 + 1) * K]
    dl, dr = (xl1 - xl) * K, (xr1 - xr) * K
    r[:, :384 * K] = np.roll(r[:, :384 * K], dl, 1); r[:, 384 * K:] = np.roll(r[:, 384 * K:], dr, 1)
F = 6 * K; ins = np.zeros((INS * K, sw * K, 3), np.float32); y = 0
while y < INS * K:
    n = min(blk.shape[0], INS * K - y); ins[y:y + n] = blk[:n]
    if y: w = np.linspace(0, 1, F)[:, None, None]; ins[y:y + F] = ins[y - F:y] * 0 + blk[:F] * w + rows(B1 - 2, B1)[:1].repeat(F, 0) * (1 - w) if False else ins[y:y + F]
    y += n
canvas = np.concatenate([rows(C, SPLIT), ins, rows(SPLIT, sh)], 0)
# sand mask on the canvas (from the src mask, same row bookkeeping)
sm = np.concatenate([sand[C:SPLIT], np.tile(sand[B1 - 1:B1], (INS, 1)), sand[SPLIT:]], 0).astype(np.uint8)
sm = cv2.resize(sm, (sw * K, sm.shape[0] * K), interpolation=cv2.INTER_NEAREST)
n, lab = cv2.connectedComponents(sm); sq = (lab == lab[sm.shape[0] // 2, sw * K // 2]).astype(np.uint8)
sq = cv2.erode(sq, np.ones((9, 9), np.uint8))          # leave the painted outlines along the edges alone
col = np.median(canvas[sq > 0].reshape(-1, 3), 0); print('sand', col, 'inserted rows', INS, 'top crop', C)
a = cv2.GaussianBlur(sq.astype(np.float32), (0, 0), 3)[..., None]
canvas = canvas * (1 - a) + col * a
out = cv2.resize(canvas, (OW, OH), interpolation=cv2.INTER_AREA)
cv2.imwrite('plate.png', out.clip(0, 255).astype(np.uint8))
pv = out.clip(0, 255).astype(np.uint8)
cv2.ellipse(pv, (OW // 2, int(0.6 * OH)), (int(0.46 * OW), int(0.335 * OH)), 0, 0, 360, (255, 0, 255), 3)
cv2.imwrite('/tmp/claude-0/sp/g12prev.jpg', cv2.resize(pv, (585, 1266), interpolation=cv2.INTER_AREA))
