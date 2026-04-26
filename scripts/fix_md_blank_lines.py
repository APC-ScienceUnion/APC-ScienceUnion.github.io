# -*- coding: utf-8 -*-
"""Insert blank line between consecutive body lines; keep $$...$$ math intact."""
import re

path = r"f:\github\APC-ScienceUnion.github.io\source\_posts\由简入繁——代数学·Part1.md"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

m = re.match(r"(?s)(^---\r?\n.*?\r?\n---\r?\n\r?\n)(.*)$", s)
if not m:
    raise SystemExit("front matter not found")
fm, body = m.group(1), m.group(2)

# Split three simple aligned blocks: one equation per $$...$$ with blank between blocks
old1 = """$$
\\begin{aligned}
1 &= 1 \\\\[1.2em]
2 &= 1 + 1 \\\\[1.2em]
2 \\times 5 - 6 &= 2 \\times 2
\\end{aligned}
$$"""
new1 = """$$
\\begin{aligned}
1 &= 1
\\end{aligned}
$$

$$
\\begin{aligned}
2 &= 1 + 1
\\end{aligned}
$$

$$
\\begin{aligned}
2 \\times 5 - 6 &= 2 \\times 2
\\end{aligned}
$$"""

old2 = """$$
\\begin{aligned}
x &= x \\\\[1.2em]
(a + b)x &= ax + bx \\\\[1.2em]
(a - b)x &= ax - bx
\\end{aligned}
$$"""
new2 = """$$
\\begin{aligned}
x &= x
\\end{aligned}
$$

$$
\\begin{aligned}
(a + b)x &= ax + bx
\\end{aligned}
$$

$$
\\begin{aligned}
(a - b)x &= ax - bx
\\end{aligned}
$$"""

old3 = """$$
\\begin{aligned}
(a + b)^2 &= (a + b)(a + b) \\\\[1.2em]
&= a(a + b) + b(a + b) \\\\[1.2em]
&= a^2 + ab + ba + b^2 \\\\[1.2em]
&= a^2 + ab + ab + b^2 \\\\[1.2em]
&= a^2 + 2ab + b^2.
\\end{aligned}
$$"""
new3 = """$$
\\begin{aligned}
(a + b)^2 &= (a + b)(a + b)
\\end{aligned}
$$

$$
\\begin{aligned}
&= a(a + b) + b(a + b)
\\end{aligned}
$$

$$
\\begin{aligned}
&= a^2 + ab + ba + b^2
\\end{aligned}
$$

$$
\\begin{aligned}
&= a^2 + ab + ab + b^2
\\end{aligned}
$$

$$
\\begin{aligned}
&= a^2 + 2ab + b^2.
\\end{aligned}
$$"""

for old, new in ((old1, new1), (old2, new2), (old3, new3)):
    if old not in body:
        raise SystemExit(f"block not found: {old[:40]}...")
    body = body.replace(old, new, 1)

# Remove trailing two spaces (old soft line breaks)
body = re.sub(r"[ \t]+\n", "\n", body)

lines = body.splitlines()
out = []
in_math = False
for i, line in enumerate(lines):
    out.append(line)
    if i == len(lines) - 1:
        break
    nxt = lines[i + 1]
    if line.strip() == "$$":
        was_math = in_math
        in_math = not in_math
        # After closing $$, blank before following prose
        if was_math and nxt.strip() and nxt.strip() != "$$":
            out.append("")
        continue
    if in_math:
        continue
    if not line.strip():
        continue
    if not nxt.strip():
        continue
    out.append("")

body2 = "\n".join(out) + ("\n" if body.endswith("\n") else "")
with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(fm + body2)
print("OK:", path)
