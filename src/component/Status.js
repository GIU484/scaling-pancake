import React from 'react';

const Status = ({ message }) => {
  return message ? <div>{message}</div> : null;
};

export default Status;