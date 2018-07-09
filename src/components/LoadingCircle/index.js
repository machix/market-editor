import React, { Component } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import Fade from '@material-ui/core/Fade'
import styles from './styles.module.less'

class LoadingCircle extends Component {
  render() {
    const {
      loading,
    } = this.props

    return (
      <div>
        <Fade
          in={loading}
          style={{ transitionDelay: loading ? '800ms' : '0ms' }}
          unmountOnExit
        >
          <CircularProgress className={styles.loader}/>
        </Fade>
      </div>
    )
  }
}

export default LoadingCircle
