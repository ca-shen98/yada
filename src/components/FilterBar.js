import React from 'react';
import {connect} from 'react-redux';
import Actions from '../actions';
import {parse as parseTagFilters} from '../lib/TagFilters';

class FilterBar extends React.Component {
  TAG_FILTERS_INPUT_ID = 'tag_filters_input';

  state = {
    tagFiltersText: this.props.tagFiltersText,
  }

  handleApplyTagFilters = (modifyState = true, checkState = true) => {
    const tagFiltersInput = document.getElementById(this.TAG_FILTERS_INPUT_ID).value.trim();
    if (checkState && tagFiltersInput === this.state.tagFiltersText) { return; } // don't need to re-apply
    let tagFiltersExpr = null;
    if (tagFiltersInput) {
      tagFiltersExpr = parseTagFilters(tagFiltersInput);
      if (!tagFiltersExpr) { // if invalid expr, reset the input value to the current valid tag filters text state
        document.getElementById(this.TAG_FILTERS_INPUT_ID).value = this.state.tagFiltersText;
        return;
      }
    }
    if (modifyState) { this.setState({ tagFiltersText: tagFiltersInput }); }
    this.props.setTagFilters({ text: tagFiltersInput, expr: tagFiltersExpr });
  };

  handleTagFiltersKeyPress = event => { if (event.key === 'Enter') { this.handleApplyTagFilters(); } };

  handleToggleReadOnly = () => {
    // currently the prop is the previous value, before toggling
    document.getElementById(this.TAG_FILTERS_INPUT_ID).value = this.props.readOnly ? '' : this.state.tagFiltersText;
    this.handleApplyTagFilters(false, false);
    this.props.toggleReadOnly();
  };

  componentDidUpdate = prevProps => {
    if (this.props.tagFiltersText !== prevProps.tagFiltersText) {
      document.getElementById(this.TAG_FILTERS_INPUT_ID).value = this.props.readOnly ? this.props.tagFiltersText : '';
      this.handleApplyTagFilters(true, false);
    }
  };

  render = () => (
    <div className="FilterBar">
      <input
        type="text"
        id={this.TAG_FILTERS_INPUT_ID}
        disabled={!this.props.readOnly}
        placeholder={
          this.props.readOnly
            ? 'TagFilters expr - e.g. "#{tag1} | !(#{t 2} & !(#{_3}))"'
            : 'TagFilters are only enabled in ReadOnly mode'
        }
        defaultValue={this.props.readOnly ? this.state.tagFiltersText : ''}
        onKeyPress={this.handleTagFiltersKeyPress}
      />
      <button type="button" disabled={!this.props.readOnly} onClick={this.handleApplyTagFilters}>
        Apply TagFilters
      </button>
      <button type="button" onClick={this.handleToggleReadOnly}>
        Make {this.props.readOnly ? 'Editable' : 'ReadOnly'}
      </button>
    </div>
  );
}

export default connect(
  state => ({ readOnly: state.readOnly, tagFiltersText: state.tagFilters.text }),
  dispatch => ({
    toggleReadOnly: () => dispatch(Actions.TOGGLE_READ_ONLY),
    setTagFilters: tagFilters => dispatch(Actions.setTagFilters(tagFilters)),
  }),
)(FilterBar);
