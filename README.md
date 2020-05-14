## [Yada - Yet another docs app](https://ca-shen98.github.io/yada)

**\[TLDR\] the idea:** a novel/unique paradigm for information management by curating distinct view files of (outliner
notes) docs that act as consolidated single sources-of-truth for content/knowledge bases via annotations/tags on pieces
of information (blocks/lines) within the files.

#### Overview (key concepts/core idea)
* Files can be either *views* or *docs*.
* The first-class entity within a doc/file/view is a *block*, which represents a piece of information within an
*outliner framework*.
* Docs can be considered as *knowledge bases* that *consolidate* pieces of information together within a *single
source-of-truth*.
* *Curate* distinct views of *content* stored in docs by allowing each block to be *tagged* with (possibly multiple)
*annotations* that describe how to represent the given block in an associated view.
    * The resulting views with respect to the distinct tagged annotation names/titles contain only the blocks associated
    (tagged) with the respective view name/title.
    * This *paradigm* reduces *duplication* of pieces of the same content across various files.

#### Example use cases
* Project details doc/wiki -> PSA \| slidedeck \| published wiki \| ...
* Project plan -> roadmap \| sprint/tasks board \| backlog list \| ...
* Topic knowledge base -> lesson plans \| subset topic section in encapsulating doc \| study notes \| ...
* Full career history tracker -> resumes with flexible content for targetting different jobs

#### Analogies/Inspirations
 * Decouple modles of data/state/etc. from view layers in software (MVC, etc.)
 * Representing views as relations on top of tables in databases
 * Tags for posts on social sites, etc.; or for files in filesystems

#### Relevant links
* Bootstrapped using [Create React App](https://github.com/facebook/create-react-app).
* Leverages/built on top of [outline/rich-markdown-editor](https://github.com/outline/rich-markdown-editor) which itself
is built on top of [Prosemirror](https://prosemirror.net/).

---
&copy; 2020 Carl Shen (ca-shen98)
