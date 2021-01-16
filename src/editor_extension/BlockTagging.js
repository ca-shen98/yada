import {Extension} from 'rich-markdown-editor';
import SelectNodePlugin from './plugins/SelectNode';
import TagFilteringPlugin from './plugins/TagFiltering';

class BlockTagging extends Extension {
  get name() { return 'yada-blockTagging'; }
  get plugins() { return [SelectNodePlugin, TagFilteringPlugin]; }
}

export default new BlockTagging();
