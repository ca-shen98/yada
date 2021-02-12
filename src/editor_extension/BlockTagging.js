import {Extension} from 'rich-markdown-editor';
import CancelLineBreaksPlugin from './plugins/CancelLineBreaks';
import SelectNodePlugin from './plugins/SelectNode';
import TagFilteringPlugin from './plugins/TagFiltering';

class BlockTagging extends Extension {
  get name() { return 'yada-blockTagging'; }
  get plugins() { return [CancelLineBreaksPlugin, SelectNodePlugin, TagFilteringPlugin]; }
}

export default new BlockTagging();
