import React from 'react';
import Button from '@material-ui/core/Button';

class LoggingButton extends React.Component {
  handleClick = () => {
    alert('this is:', this);
  }

  render() {
    return (
      <div>
        <Button variant="contained" color="primary">
          Hello World
          </Button>
      </div>
    );
  }
}

export default LoggingButton;