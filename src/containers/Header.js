import React from 'react';
import {connect} from 'react-redux';
import nearley from 'nearley'
import TagFiltersTextGrammar from './TagFiltersTextGrammar'
import Actions from '../actions';
import {PROPS_LOCAL_STORAGE_KEYS} from '../reducers/ToggleEditorProps';

class Header extends React.Component {
  FILTERS_LOCAL_STORAGE_KEY = 'filters';
  TAG_FILTERS_INPUT_ID = 'tag_filters_input';
  TAG_FILTERS_BUTTON_ID = 'tag_filters_button';

  state = {
    tagFiltersDirty: true,
    tagFiltersText: localStorage.getItem(this.FILTERS_LOCAL_STORAGE_KEY) || '',
    tagFiltersExpr: undefined,
  };

  handleApplyTagFilters = () => {
    if (this.props.editorReadOnly) { // sanity check
      if (this.state.tagFiltersDirty) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(TagFiltersTextGrammar));
        try {
          parser.feed(this.state.tagFiltersText.trim());
        } catch(ex) {
          // invalid
          return;
        }
        const parsed = parser.results;
        if (parsed.length === 0) {
          // incomplete
          return;
        }
        localStorage.setItem(this.FILTERS_LOCAL_STORAGE_KEY, this.state.tagFiltersText);
        this.setState({tagFiltersDirty: false, tagFiltersExpr: parser.results});
      }
      // TODO pass tagFiltersExpr value to editor somehow (via redux?)
    }
  };

  // is there a race condition with the following two methods that would cause the disabled text value to be saved?
  handleTagFiltersChange = () => {
    if (this.props.editorReadOnly) {
      this.setState({
        tagFiltersDirty: true,
        tagFiltersText: document.getElementById(this.TAG_FILTERS_INPUT_ID).value,
      });
    }
  };

  handleTagFiltersEnter = event => {
    if (event.key === 'Enter') {
      this.handleApplyTagFilters();
    }
  }

  handleToggleEditorReadOnly = () => {
    this.props.toggleEditorReadOnly();
    // dispatch is async? so state/prop change only happens once function exits? so the prop is the previous value.
    localStorage.setItem(PROPS_LOCAL_STORAGE_KEYS.EDITOR_READ_ONLY,
      this.props.editorReadOnly ? 'Editable' : 'ReadOnly');
    document.getElementById(this.TAG_FILTERS_INPUT_ID).value =
      this.props.editorReadOnly ? '' : this.state.tagFiltersText;
  };

  handleToggleEditorDarkMode = () => {
    this.props.toggleEditorDarkMode();
    // dispatch is async? so state/prop change only happens once function exits? so the prop is the previous value.
    localStorage.setItem(PROPS_LOCAL_STORAGE_KEYS.EDITOR_DARK_MODE,
      this.props.editorDarkMode ? 'Light' : 'Dark');
  };

  render = () => (
    <div className="Header">
      <button type="button" onClick={this.handleToggleEditorDarkMode}>
        {this.props.editorDarkMode ? 'Light' : 'Dark'} Theme
      </button>
      <button type="button" onClick={this.handleToggleEditorReadOnly}>
        Make {this.props.editorReadOnly ? 'Editable' : 'ReadOnly'}
      </button>
      <button
        type="button"
        id={this.TAG_FILTERS_BUTTON_ID}
        disabled={!this.props.editorReadOnly}
        onClick={this.handleApplyTagFilters}
      >
        Apply TagFilters
      </button>
      <input
        type="text"
        id={this.TAG_FILTERS_INPUT_ID}
        disabled={!this.props.editorReadOnly}
        placeholder={
          this.props.editorReadOnly ?
            'TagFilters expr - e.g. "#{tag1} | !(#{t2} & !(#{_3}))"' : 'TagFilters are only enabled in ReadOnly mode'
        }
        defaultValue={this.props.editorReadOnly ? this.state.tagFiltersText : ''}
        onKeyPress={this.handleTagFiltersEnter}
        onChange={this.handleTagFiltersChange}
      />
    </div>
  );
}

export default connect(
  state => ({editorDarkMode: state.editorDarkMode, editorReadOnly: state.editorReadOnly}),
  dispatch => ({
    toggleEditorDarkMode: () => dispatch(Actions.TOGGLE_EDITOR_DARK_MODE),
    toggleEditorReadOnly: () => dispatch(Actions.TOGGLE_EDITOR_READ_ONLY),
  }),
)(Header);
