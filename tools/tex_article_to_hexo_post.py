# -*- coding: utf-8 -*-
"""Convert local LaTeX article (1.tex + ref.bib) to a Hexo Butterfly post.

默认读取：C:\\Users\\10849\\Downloads\\tex\\1.tex
输出：source/_posts/先问「是什么」：数学与形式化数学浅讲.md

日后若新增 tex 文件，可复制本脚本并改 TEX_PATH、OUT_PATH、FIG_NAMES、REF_ENTRIES。
运行：在仓库根目录执行  python tools/tex_article_to_hexo_post.py
"""
from __future__ import annotations

import re
import textwrap
from pathlib import Path

TEX_PATH = Path(r"C:\Users\10849\Downloads\tex\1.tex")
OUT_PATH = Path(__file__).resolve().parents[1] / "source" / "_posts" / "先问「是什么」：数学与形式化数学浅讲.md"

# TeX \\graphicspath{{figures/}} + includegraphics filename
FIG_BASE = r"C:\Users\10849\Downloads\tex\figures"
# (文件名, 子图字母, 子图说明, 与 LaTeX 图注一致的上标引用序号, 参考来源说明)
FIG_NAMES = [
    (
        "Bertrand1-figure.svg.png",
        "a",
        "随机取端点",
        "1",
        "Wikimedia Commons（ref.bib：FileBertrand1figuresvgWikipedia）",
    ),
    (
        "Bertrand2-figure.svg.png",
        "b",
        "随机取半径与弦交点",
        "2",
        "Wikimedia Commons（FileBertrand2figuresvgWikipedia）",
    ),
    (
        "Bertrand3-figure.svg.png",
        "c",
        "随机取中点",
        "3",
        "Wikimedia Commons（FileBertrand3figuresvgWikipedia）",
    ),
]

FRONT_MATTER = """---
title: 先问「是什么」：数学与形式化数学浅讲
date: 2026-04-03 12:00:00
tags: ['数学','数理逻辑','数学史','科普','形式化']
categories: '数学'
copyright_author: 'silverxz'
katex: true
---

> 作者：silverxz
> （本文由 LaTeX / LaTeXmk 源稿转换；插图 src 为占位，上传图床后请替换。）

"""

# ref.bib — build numbered references from first appearance of each (key, postnote)
REF_ENTRIES: dict[str, str] = {
    "FileBertrand1figuresvgWikipedia": "Wikimedia Commons. File:Bertrand1-figure.svg[EB/OL]. https://commons.wikimedia.org/wiki/File:Bertrand1-figure.svg",
    "FileBertrand2figuresvgWikipedia": "Wikimedia Commons. File:Bertrand2-figure.svg[EB/OL]. https://commons.wikimedia.org/wiki/File:Bertrand2-figure.svg",
    "FileBertrand3figuresvgWikipedia": "Wikimedia Commons. File:Bertrand3-figure.svg[EB/OL]. https://commons.wikimedia.org/wiki/File:Bertrand3-figure.svg",
    "bairLeibnizsWellfoundedFictions2018": "Bair J, Blaszczyk P, Ely R, et al. Leibniz's Well-Founded Fictions and Their Interpetations[J]. Matematychni Studii, 2018, 49(2): 186-224. DOI: 10.15330/ms.49.2.186-224",
    "bosDifferentialsHigherorderDifferentials1974": "Bos H J M. Differentials, Higher-Order Differentials and the Derivative in the Leibnizian Calculus[J]. Archive for History of Exact Sciences, 1974, 14(1): 1-90.",
    "EarliestUsesSymbols": "Miller J. Earliest Uses of Symbols of Set Theory and Logic[EB/OL]. Maths History. https://mathshistory.st-andrews.ac.uk/Miller/mathsym/set/",
    "russellDenoting1905": "Russell B. On Denoting[J]. Mind, 1905, 14(56): 479-493.",
    "voevodskyOriginsMotivationsUnivalent2014": "Voevodsky V. The Origins and Motivations of Univalent Foundations[J]. The Institute Letter, 2014: 8-9.",
    "MathlibStatistics": "Lean Prover Community. Mathlib Statistics[EB/OL]. https://leanprover-community.github.io/mathlib_stats.html",
    "gonthierFormalProofFourcolor2008": "Gonthier G. Formal Proof–the Four-Color Theorem[J]. Notices of the AMS, 2008, 55(11): 1382-1393.",
    "grantLeibnizSpellContinuous1994": "Grant H. Leibniz and the Spell of the Continuous[J]. The College Mathematics Journal, 1994, 25(4): 291-294.",
    "ferraroEulerInfinitesimalsLimits2012": "Ferraro G. Euler, Infinitesimals and Limits[J]. 2012.",
    "blaszczykTenMisconceptionsHistory2013": "Blaszczyk P, Katz M G, Sherry D. Ten Misconceptions from the History of Analysis and Their Debunking[J]. Foundations of Science, 2013, 18(1): 43-74.",
    "nettoVorlesungenUeberTheorie1894": "Netto E. Vorlesungen über die Theorie der Einfachen und der Vielfachen Integrale[M]. B. G. Teubner, 1894.",
    "FoundationsMathematicsDavid": "Hilbert D. Foundations of Mathematics (1927)[EB/OL]. https://www.marxists.org/reference/subject/philosophy/works/ge/hilbert.htm",
    "beziauWhatFormalLogic2008": "Beziau J Y. What Is ‘Formal Logic’[C]//Proceedings of the XXII World Congress of Philosophy, 2008, 13: 9-22.",
    "simpsonPartialRealizationsHilberts1988": "Simpson S G. Partial Realizations of Hilbert's Program[J]. The Journal of Symbolic Logic, 1988, 53(2): 349-363.",
    "zachPracticeFinitismEpsilon2003": "Zach R. The Practice of Finitism: Epsilon Calculus and Consistency Proofs in Hilbert's Program[J]. Synthese, 2003, 137(1): 211-259.",
    "smithDoesMathematicsNeed2023": "Smith P. Does Mathematics Need a Philosophy?[EB/OL]. Logic Matters, 2023-02-15. https://www.logicmatters.net/2023/02/15/does-mathematics-need-a-philosophy/",
}


def figure_html() -> str:
    """HTML 结构对齐 LaTeX subfigure：三列 + 子图题 + 总标题。"""
    lines = [
        "<!-- 子图版式对齐 LaTeX subfigure；上传图床后替换各 img 的 src -->",
        '<figure class="bertrand-figure" style="margin:1.25em auto;max-width:100%;box-sizing:border-box;text-align:center;">',
        '<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:14px 2%;width:100%;box-sizing:border-box;" role="group" aria-label="伯特兰悖论三种随机取弦方法">',
    ]
    for fn, letter, cap, cite_num, src_note in FIG_NAMES:
        full = str(Path(FIG_BASE) / fn)
        rel = f"figures/{fn}"
        label = f"({letter})"
        lines.append(
            '<div style="flex:1 1 28%;max-width:32%;min-width:min(100%,200px);margin:0;box-sizing:border-box;text-align:center;">'
        )
        lines.append(
            f'  <img src="" alt="{label} {cap}" style="width:100%;max-width:280px;height:auto;display:block;margin:0 auto;vertical-align:top;" loading="lazy" decoding="async" />'
        )
        lines.append(
            f'  <div style="font-size:0.9em;line-height:1.45;margin-top:0.5em;color:var(--font-color,#3c4858);">{label} {cap}<sup style="font-size:0.82em;">[{cite_num}]</sup></div>'
        )
        lines.append(
            f'  <div style="font-size:11px;line-height:1.35;margin-top:0.35em;color:var(--blockquote-color,#888);">原始：{rel} · {full}</div>'
        )
        lines.append("</div>")
    lines.append("</div>")
    lines.append(
        '<figcaption style="display:block;font-size:0.95em;line-height:1.5;margin-top:1em;color:var(--blockquote-color,#666);">图 1：三种不同的随机取弦方法</figcaption>'
    )
    lines.append("</figure>")
    lines.append(
        '<p style="font-size:11px;line-height:1.4;margin:0.35em 0 0;text-align:center;color:var(--blockquote-color,#888);">子图题上标 [1][2][3] 仅对应三幅插图的 Commons 出处（与正文 <code>^[n]^</code> 论文参考文献序号不同）。</p>'
    )
    lines.append(
        f'<p style="font-size:11px;line-height:1.4;color:var(--blockquote-color,#888);text-align:center;margin:0.25em 0 0;">参考：{FIG_NAMES[0][4]}；{FIG_NAMES[1][4]}；{FIG_NAMES[2][4]}</p>'
    )
    return "\n".join(lines)


def strip_tex_comments(s: str) -> str:
    out = []
    for line in s.splitlines():
        if line.strip().startswith("%"):
            continue
        # remove unescaped % comment
        if "%" in line:
            i, buf = 0, []
            while i < len(line):
                if line[i] == "%" and (i == 0 or line[i - 1] != "\\"):
                    break
                buf.append(line[i])
                i += 1
            line = "".join(buf).rstrip()
        out.append(line)
    return "\n".join(out)


def mdframed_to_blockquote(body: str) -> str:
    while True:
        m = re.search(r"\\begin\{mdframed\}", body)
        if not m:
            break
        start = m.start()
        depth = 0
        i = m.start()
        while i < len(body):
            if body.startswith("\\begin{mdframed}", i):
                depth += 1
                i += len("\\begin{mdframed}")
            elif body.startswith("\\end{mdframed}", i):
                depth -= 1
                i += len("\\end{mdframed}")
                if depth == 0:
                    inner = body[m.end() : i - len("\\end{mdframed}")]
                    inner = inner.strip()
                    inner = inner.replace("\\\\", "\n")
                    inner = inner.replace("\\,", " ")
                    lines = []
                    for ln in inner.split("\n"):
                        ln = ln.strip()
                        if not ln:
                            lines.append(">")
                        else:
                            lines.append("> " + ln)
                    block = "\n".join(lines)
                    body = body[:start] + "\n" + block + "\n" + body[i:]
                    break
            else:
                i += 1
        else:
            raise RuntimeError("unclosed mdframed")
    return body


def replace_figure_block(body: str) -> str:
    pat = re.compile(
        r"\\begin\{figure\}.*?\\end\{figure\}", re.DOTALL
    )
    return pat.sub(lambda _m: figure_html(), body, count=1)


REMARKS_MARKER = "<<<HEXO_REMARKS_BLOCK>>>"


def extract_remarks_block(body: str) -> tuple[str, dict[str, int], str]:
    """Replace remarks enumerate with a marker (before sub_refs, so indices stay valid)."""
    bib = body.find("\\printbibliography")
    if bib == -1:
        raise RuntimeError("no printbibliography")
    head = body[:bib]
    tail = body[bib:]
    start = head.rfind("\\begin{enumerate}")
    if start == -1:
        raise RuntimeError("no enumerate")
    end = head.find("\\end{enumerate}", start)
    if end == -1:
        raise RuntimeError("no end enumerate")
    end_close = end + len("\\end{enumerate}")
    enum_block = head[start:end_close]
    mm = re.match(
        r"\\begin\{enumerate\}(?:\[[^\]]*\])?\s*(.*)\s*\\end\{enumerate\}",
        enum_block.strip(),
        re.DOTALL,
    )
    if not mm:
        raise RuntimeError("bad enumerate block")
    inner = mm.group(1)
    items = re.split(r"\\item\s*", inner)
    items = [x.strip() for x in items if x.strip()]
    label_to_num: dict[str, int] = {}
    out_items: list[str] = []
    for idx, it in enumerate(items, start=1):
        lm = re.match(r"\\label\{([^}]+)\}\s*(.*)", it, re.DOTALL)
        if lm:
            label_to_num[lm.group(1)] = idx
            it = lm.group(2).strip()
        it = re.sub(r"\\label\{[^}]+\}\s*", "", it)
        it = textwrap.dedent(it).strip()
        out_items.append(f"注 {idx}. {it}")
    # 正文里已有 \\section*{Remarks} 转成的「# Remarks」，此处只输出各条注，避免重复标题
    remarks_md = "\n\n".join(out_items)
    new_body = head[:start] + REMARKS_MARKER + head[end_close:] + tail
    return new_body, label_to_num, remarks_md


def sub_refs(body: str, label_to_num: dict[str, int]) -> str:
    body = re.sub(r"\\ref\{fig:Bertrand-1\}", "图 1（左）", body)
    body = re.sub(r"\\ref\{fig:Bertrand-2\}", "图 1（中）", body)
    body = re.sub(r"\\ref\{fig:Bertrand-3\}", "图 1（右）", body)

    def repl(m: re.Match) -> str:
        lab = m.group(1)
        if lab.startswith("fig:"):
            return m.group(0)
        n = label_to_num.get(lab)
        if n is None:
            return m.group(0)
        return f"注 {n}"

    body = re.sub(r"\\ref\{([^}]+)\}", repl, body)
    return body


def replace_autocite(body: str) -> tuple[str, list[tuple[int, str, str]]]:
    cite_pat = re.compile(r"\\autocite(?:\[([^\]]*)\])?\{([^}]+)\}")
    citations: list[tuple[int, str, str]] = []
    key_opt_to_n: dict[tuple[str, str], int] = {}
    counter = 0

    def repl(m: re.Match) -> str:
        nonlocal counter
        opt_raw = m.group(1) or ""
        key = m.group(2)
        opt = opt_raw.replace("~", " ").strip()
        k = (key, opt_raw)
        if k not in key_opt_to_n:
            counter += 1
            key_opt_to_n[k] = counter
            citations.append((counter, key, opt_raw))
        n = key_opt_to_n[k]
        return f"^[{n}]^"

    body = cite_pat.sub(repl, body)
    return body, citations


def postnote_suffix(postnote: str) -> str:
    if not postnote:
        return ""
    s = postnote.replace("~", " ").replace("pp.", "pp.").strip()
    return f"（{s}）"


def build_references_section(citations: list[tuple[int, str, str]]) -> str:
    lines = ["# 参考文献", ""]
    for n, key, postnote in citations:
        base = REF_ENTRIES.get(key, f"[{key}] 请从 ref.bib 补全")
        suf = postnote_suffix(postnote)
        lines.append(f"[{n}] {base}{suf}")
    return "\n".join(lines)


def emph(s: str) -> str:
    while True:
        m = re.search(r"\\emph\{", s)
        if not m:
            break
        i = m.end()
        depth = 1
        j = i
        while j < len(s) and depth:
            if s[j] == "{" and s[j - 1] != "\\":
                depth += 1
            elif s[j] == "}" and s[j - 1] != "\\":
                depth -= 1
            j += 1
        inner = s[i : j - 1]
        s = s[: m.start()] + f"*{inner}*" + s[j:]
    return s


def clean_leftovers(s: str) -> str:
    s = s.replace("\\maketitle", "")
    s = s.replace("\\printbibliography", "")
    s = re.sub(r"\\label\{[^}]+\}", "", s)
    s = s.replace("\\lbrack", "[").replace("\\rbrack", "]")
    s = s.replace("\\,", " ")
    s = re.sub(r"\\section\*\{([^}]+)\}", r"\n\n# \1\n\n", s)
    return s


def add_paragraph_indent_body(s: str) -> str:
    """Prefix &emsp;&emsp; to plain text paragraph first lines (blog style)."""
    lines = s.split("\n")
    out = []
    prev_blank = True
    in_display = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            out.append("")
            prev_blank = True
            continue
        if stripped.startswith("$$"):
            in_display = not in_display
        skip_prefix = (
            stripped.startswith("#")
            or stripped.startswith(">")
            or stripped.startswith("<")
            or stripped.startswith("$$")
            or stripped.startswith("\\[")
            or stripped.startswith("$")
            or stripped.startswith("\\")
            or stripped.startswith("注 ")
            or (stripped.startswith("[") and len(stripped) > 1 and stripped[1].isdigit())
            or in_display
        )
        if prev_blank and not skip_prefix and not line.startswith("&emsp;"):
            line = "&emsp;&emsp;" + line.lstrip()
        out.append(line)
        prev_blank = False
    return "\n".join(out)


def add_paragraph_indent(full: str) -> str:
    """Do not indent YAML front matter."""
    m = re.match(r"^((?:---\r?\n.*?\r?\n---\r?\n))", full, re.DOTALL)
    if not m:
        return add_paragraph_indent_body(full)
    return m.group(1) + add_paragraph_indent_body(full[m.end() :])


def polish_markdown(body: str) -> str:
    body = body.replace("如图图 ", "如图 ")
    body = body.replace("\\#", "#")
    return body


def main() -> None:
    raw = TEX_PATH.read_text(encoding="utf-8")
    raw = strip_tex_comments(raw)
    m = re.search(r"\\begin\{document\}(.*)\\end\{document\}", raw, re.DOTALL)
    if not m:
        raise SystemExit("no document body")
    body = m.group(1).strip()

    body = replace_figure_block(body)
    body, label_to_num, remarks_md = extract_remarks_block(body)
    body = sub_refs(body, label_to_num)
    body = body.replace(REMARKS_MARKER, "\n\n" + remarks_md + "\n\n")
    body = mdframed_to_blockquote(body)
    body = emph(body)
    body, citations = replace_autocite(body)
    body = clean_leftovers(body)
    body = polish_markdown(body)

    refs = build_references_section(citations)
    final = FRONT_MATTER + "\n" + body.strip() + "\n\n" + refs + "\n"
    final = add_paragraph_indent(final)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(final, encoding="utf-8")
    print("Wrote", OUT_PATH)


if __name__ == "__main__":
    main()
