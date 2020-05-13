import React from 'react';
import { debounce } from 'lodash';
import Editor from 'rich-markdown-editor';
import './App.css';

class App extends React.Component {
  state = {
    readOnly: false,
  };

  render() {
    return (
      <div className="App">
        <header>
          <br /> {/*TODO don't use brs for spacing*/}
          <button // TODO outline doesn't show in mobile web (text still visible and clickable though).
            type="button"
            style={{'minWidth': '80px'}}
            onClick={() => this.setState({ readOnly: !this.state.readOnly })}
          >
            {this.state.readOnly ? "Editable" : "ReadOnly"}
          </button>
        </header>
        <br/> {/*TODO don't use brs for spacing*/}
        <Editor // TODO the checklist is pretty janky, can we remove the option.
          readOnly={this.state.readOnly}
          defaultValue={localStorage.getItem('saved') || ''}
          onChange={debounce(value => localStorage.setItem('saved', value()), 250)}
        />
      </div>
    );
  }
}

export default App;
