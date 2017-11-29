import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import TreeBrowser from './components/TreeBrowser';
import Console from './components/Console';
import AceEditor from 'react-ace';
import {dir, readFile, writeFile} from './truffle/files';
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
    this.onSelectFile = this.onSelectFile.bind(this);
    this.onMigrationEvent = this.onMigrationEvent.bind(this);
    this.onTestEvent = this.onTestEvent.bind(this);
    const self = this;
    this.state = {
      migrations: [],
      contracts: [],
      tests: [],
      file: {},
      events: [],
    };
    async function load() {
      const migrations = await dir('/migrations');
      const contracts = await dir('/contracts');
      const tests = await dir('/test');
      self.setState({
        migrations: (migrations || []).map(m => ({
          name: m,
          type: 'file',
          path: `/migrations/${m}`,
        })),
        contracts: (contracts || []).map(c => ({
          name: c,
          type: 'file',
          path: `/contracts/${c}`,
        })),
        tests: (tests || []).map(c => ({
          name: c,
          type: 'file',
          path: `/test/${c}`,
        })),
      });
    }
    load();
  }

  async onChange(newValue) {
    if (this.state.file.content) {
      this.setState({
        file: {
          ...this.state.file,
          content: newValue,
        },
      });
      await writeFile({path: this.state.file.path, content: newValue});
    }
  }

  onMigrationEvent(event) {
    console.log('ON MIGRATION EVENT: ', event);
    this.setState({
      events: [...this.state.events, event],
    });
  }

  async onRunMigrations() {
    this.setState({
      events: [],
    });
    await migrate(this.onMigrationEvent);
    console.log('LOL migrated!');
  }

  async onCompile() {
    await compile();
    console.log('compiled!!!!!!');
  }

  onTestEvent(event) {
    this.setState({
      events: [...this.state.events, event],
    });
  }

  async onTest() {
    this.setState({
      events: [],
    });
    await test(this.onTestEvent);
    console.log('test!!!!!!');
  }

  onSelectFile(file) {
    console.log('SELECT FILE: ', file);
    if (file.type === 'file') {
      const content = readFile(file.path).then(content => {
        console.log('file: ', file);
        this.setState({
          file: {
            ...file,
            content,
          },
        });
      });
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header" />
        <TreeBrowser
          className="App-filebrowser"
          onClick={this.onSelectFile}
          tree={{
            name: 'Root',
            children: [
              {
                name: 'Migrations',
                type: 'dir',
                children: this.state.migrations,
              },
              {
                name: 'Contracts',
                type: 'dir',
                children: this.state.contracts,
              },
              {name: 'Tests', type: 'dir', children: this.state.tests},
            ],
          }}
        />
        <div className="App-body">
          <button onClick={this.onRunMigrations}>Migrate</button>
          <button onClick={this.onCompile}>Compile</button>
          <button onClick={this.onTest}>Test</button>
          <AceEditor
            value={this.state.file.content}
            onChange={this.onChange}
            name="editor"
            editorProps={{$blockScrolling: true}}
          />
        </div>
        <div className="App-drawer">
          <Console events={this.state.events} />
        </div>
      </div>
    );
  }
}

export default App;
