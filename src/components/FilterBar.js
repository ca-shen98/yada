import React from 'react';
import {connect} from 'react-redux';
import Actions from '../actions';
import {parse as parseTagFilters} from '../lib/TagFiltersExpression';
import {SOURCE_FILE_NAME_TYPE} from "../reducers/SetFile";

const TAG_FILTERS_INPUT_ID = 'tag_filters_input';

class FilterBar extends React.Component {
  state = { tagFiltersText: this.props.tagFiltersText }

  handleApplyTagFilters = () => {
    const tagFiltersInput = document.getElementById(TAG_FILTERS_INPUT_ID).value.trim();
    if (tagFiltersInput === this.state.tagFiltersText) { return; } // don't need to re-apply
    let tagFiltersExpr = null;
    if (tagFiltersInput) {
      tagFiltersExpr = parseTagFilters(tagFiltersInput);
      if (!tagFiltersExpr) { // if invalid expr, reset the input value to the current valid tag filters text state
        document.getElementById(TAG_FILTERS_INPUT_ID).value = this.state.tagFiltersText;
        return;
      }
    }
    this.props.setTagFilters({ text: tagFiltersInput, expr: tagFiltersExpr });
    // state set in componentDidUpdate
  };

  handleTagFiltersKeyPress = event => { if (event.key === 'Enter') { this.handleApplyTagFilters(); } };

  handleToggleReadOnly = () => {
    // currently the prop is the previous value, before toggling
    document.getElementById(TAG_FILTERS_INPUT_ID).value = this.props.readOnly ? '' : this.state.tagFiltersText;
    this.handleApplyTagFilters();
    this.props.setReadOnly(!this.props.readOnly);
  };

  componentDidUpdate = prevProps => {
    if (this.props.tagFiltersText !== prevProps.tagFiltersText) {
      document.getElementById(TAG_FILTERS_INPUT_ID).value = this.props.readOnly ? this.props.tagFiltersText : '';
      this.setState({ tagFiltersText: this.props.tagFiltersText });
    }
  };

  render = () => {
    return (
      <div className="FilterBar">
        <input
          type="text"
          id={TAG_FILTERS_INPUT_ID}
          disabled={this.props.fileType !== SOURCE_FILE_NAME_TYPE || !this.props.readOnly}
          placeholder={
            this.props.fileType !== SOURCE_FILE_NAME_TYPE || !this.props.readOnly
              ? 'TagFilters are only enabled for __source files in ReadOnly mode'
              : 'TagFilters expr - e.g. "#{tag1} | !(#{t 2} & !(#{_3}))"'
          }
          defaultValue={this.props.readOnly ? this.state.tagFiltersText : ''}
          onKeyPress={this.handleTagFiltersKeyPress}
        />
        <button
            type="button"
            disabled={this.props.fileType !== SOURCE_FILE_NAME_TYPE || !this.props.readOnly}
            onClick={this.handleApplyTagFilters}>
          Apply TagFilters
        </button>
        <button type="button" onClick={this.handleToggleReadOnly}>
          Make {this.props.readOnly ? 'Editable' : 'ReadOnly'}
        </button>
      </div>
    );
  };
}

export default connect(
  state => ({
    readOnly: state.readOnly,
    fileType: state.file.fileType,
    tagFiltersText: state.tagFilters.text,
  }),
  dispatch => ({
    setReadOnly: readOnly => dispatch(Actions.setReadOnly(readOnly)),
    setTagFilters: tagFilters => dispatch(Actions.setTagFilters(tagFilters)),
  })
)(FilterBar);
