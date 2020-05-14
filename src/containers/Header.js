import React from 'react';
import { connect } from 'react-redux';
import { TOGGLE_EDITOR_READ_ONLY } from "../actions";

class Header extends React.Component {
  state = {
    tagFiltersDirty: false,
    tagFiltersText: '',
    tagFiltersExpr: undefined,
  };

  TAG_FILTERS_ID = 'tag_filters_input';

  handleApplyTagFilters = () => {
    if (this.props.editorReadOnly) { // sanity check
      if (this.state.tagFiltersDirty) {
        // parse tagFiltersText value to set tagFiltersExpr value
        this.setState({ tagFiltersDirty: false });
      }
      // pass tagFiltersExpr value to editor somehow (via redux)
    }
  };

  // is there a race condition with the following two methods that would cause the disabled text value to be saved?
  handleTagFiltersChange = () => {
    if (this.props.editorReadOnly) {
      this.setState({ tagFiltersDirty: true, tagFiltersText: document.getElementById(this.TAG_FILTERS_ID).value });
    }
  };

  handleToggleEditorReadOnly = () => {
    this.props.toggleEditorReadOnly();
    // dispatch is async? so state/prop change only happens once function exits?
    document.getElementById(this.TAG_FILTERS_ID).value = this.props.editorReadOnly ? '' : this.state.tagFiltersText;
  };

  render = () => (
    <div className="Header">
      <button type="button" onClick={this.handleToggleEditorReadOnly}>
        Make {this.props.editorReadOnly ? 'Editable' : 'ReadOnly'}
      </button>
      <button
        type="button"
        disabled={!this.props.editorReadOnly}
        onClick={this.handleApplyTagFilters}
      >
        Apply TagFilters
      </button>
      <input
        type="text"
        id={this.TAG_FILTERS_ID}
        disabled={!this.props.editorReadOnly}
        placeholder={
          this.props.editorReadOnly ?
            'TagFilters expr - e.g. "(#tag1 | #tag2) & #tag3"' : 'TagFilters are only enabled in ReadOnly mode'
        }
        onChange={this.handleTagFiltersChange}
      />
    </div>
  );
}

export default connect(
  state => ({editorReadOnly: state.editorReadOnly}),
  dispatch => ({
    toggleEditorReadOnly: () => dispatch(TOGGLE_EDITOR_READ_ONLY),
  }),
)(Header);
