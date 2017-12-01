import React, {Component} from 'react';

const Tree = props => {
  const onClick = () => {
    if (props.onClick) {
      props.onClick(props.tree);
    }
  };
  const childNodes =
    props &&
    props.tree &&
    props.tree.children &&
    props.tree.children.map(node => (
      <li>
        <Tree tree={node} onClick={props.onClick} />
      </li>
    ));
  return (
    <div>
      <div class="name" onClick={onClick}>
        {props.tree.name}
      </div>
      {childNodes && <ul>{childNodes}</ul>}
    </div>
  );
};

const TreeBrowser = props => {
  return <Tree {...props} />;
};

export default TreeBrowser;
