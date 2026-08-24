# English editorial standard

The English edition is an adaptation of each current Chinese source, not a
word-for-word transcript. Its job is to preserve the author's claims, tone,
examples, and level of formality in idiomatic American English.

## Fidelity

- Keep every factual claim, number, date, quotation, citation, caveat, and
  conclusion from the source.
- Do not add background facts, interpretations, or corrections that the source
  does not contain. If the source itself needs correction, edit the source
  first and let the source fingerprint mark the English version for review.
- Preserve humor, uncertainty, rhetorical questions, and deliberate changes of
  register when they are part of the author's voice.
- Keep link targets, image paths, code, mathematical expressions, data,
  front matter, HTML structure, and Hexo tags unchanged unless a site-wide
  migration explicitly requires otherwise.

## Natural English

- Translate the purpose of a title, idiom, joke, or recurring column name, not
  its individual words. A title must sound like something an English-language
  science writer would actually publish.
- Rebuild sentences around natural English subjects and verbs. Do not retain
  Chinese topic-comment order, repeated connective phrases, or long chains of
  coordinate clauses merely because the source uses them.
- Use established terminology from the relevant field. Prefer plain, precise
  prose to impressive-sounding synonyms.
- Technical and reference articles should be neutral and direct. Essays and
  personal pieces may keep a more conversational rhythm when the source has
  one.
- Use sentence case for headings. Follow normal English punctuation and
  spacing, while preserving punctuation that belongs to formulas or code.

## Patterns to remove

During the second editing pass, look specifically for:

- inflated claims, promotional language, and vague attributions;
- stock AI vocabulary, filler, repeated transitions, and generic conclusions;
- unnecessary passive voice, nominalizations, and sentences with no clear
  actor;
- forced groups of three, false "from X to Y" ranges, and staged contrasts
  such as "not only X, but Y" when the source does not call for them;
- excessive em dashes, dramatic fragments, canned hooks, and repeated sentence
  openings;
- literal renderings of Chinese idioms, section labels, puns, or social-media
  phrasing that have no equivalent effect in English.

These checks follow the editing approach in
[`blader/humanizer`](https://github.com/blader/humanizer): change the prose
freely enough to sound human, then compare it with the source again so that no
claim has been lost or invented.

## Required review

1. Read the complete current Chinese source and the complete English version.
2. Rewrite the title and prose for meaning, voice, and field terminology.
3. Read the English version on its own, without looking at the Chinese, and fix
   anything that sounds translated or machine-generated.
4. Compare it with the Chinese source again for omissions or additions.
5. Run the bilingual structure, source-fingerprint, link, image, formula, and
   generated-page checks before publishing.

