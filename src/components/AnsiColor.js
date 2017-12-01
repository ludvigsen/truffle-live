import React, {Component} from 'react';

const AnsiColor = props => {
  const childNodes =
    props && props.events && props.events.map(event => <li>{event}</li>);
  return <div>{childNodes && <ul>{childNodes}</ul>}</div>;
};

export default Console;
