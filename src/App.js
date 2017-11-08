import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import AceEditor from 'react-ace';
import { dir, readFile, writeFile } from './truffle/files';
import migrate from './truffle/migrate';
import compile from './truffle/compile';
import test from './truffle/test';


class App extends Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.onRunMigrations = this.onRunMigrations.bind(this);
    this.onCompile = this.onCompile.bind(this);
    this.onTest = this.onTest.bind(this);
    const self = this;
    this.state = {
      migrations: [],
      contracts: [],
      tests: [],
      file: {},
    };
    async function load() {
      const migrations = await dir('/migrations');
      const contracts = await dir('/contracts');
      const tests = await dir('/test');
      self.setState({
        migrations: (migrations || []).map(m => ({ name: m, path: `/migrations/${m}`})),
        contracts: (contracts || []).map(c => ({ name: c, path: `/contracts/${c}`})),
        tests: (tests || []).map(c => ({ name: c, path: `/test/${c}`})),
      })
      console.log('MIGRATIONS: ', migrations);
      console.log('CONTRACTS: ', contracts);
      console.log('TESTS: ', tests);
    }
    load();
  }

  async onChange(newValue) {
    if (this.state.file.content) {
      this.setState({
        file: {
          ...this.state.file,
          content: newValue,
        }
      });
      await writeFile({ path: this.state.file.path, content: newValue });
    }
  }

  async onRunMigrations() {
    await migrate();
    console.log('LOL migrated!');
  }

  async onCompile() {
    await compile()
    console.log('compiled!!!!!!');
  }

  async onTest() {
    await test()
    console.log('test!!!!!!');
  }

  async onSelectFile(file) {
    console.log('SELECT FILE: ', file);
    const content = await readFile(file.path);
    console.log('file: ', file);
    this.setState({
      file: {
        ...file,
        content,
      },
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <ul>
          {this.state.migrations.map((m, i) => (<li key={i} onClick={() => this.onSelectFile(m)}>{m.name}</li>))}
        </ul>
        <ul>
          {this.state.contracts.map((m, i) => (<li key={i} onClick={() => this.onSelectFile(m)}>{m.name}</li>))}
        </ul>
        <ul>
          {this.state.tests.map((m, i) => (<li key={i} onClick={() => this.onSelectFile(m)}>{m.name}</li>))}
        </ul>
        <button onClick={this.onRunMigrations}>Migrate</button>
        <button onClick={this.onCompile}>Compile</button>
        <button onClick={this.onTest}>Test</button>
        <AceEditor
          value={this.state.file.content}
          onChange={this.onChange}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{$blockScrolling: true}}
        />
      </div>
    );
  }
}

export default App;
