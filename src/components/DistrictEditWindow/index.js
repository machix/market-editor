import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import styles from './styles.module.less'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import ConfirmDialog from '../ConfirmDialog'
import { notify } from 'reapop'

class DistrictEditWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showConfirmDialog: false,
      name: '',
      shortname: '',
      submarket: '',
    }
  }

  componentDidMount() {
    const { name, shortname, submarket } = this.props.district
    this.setState({
      name,
      shortname,
      submarket,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.district && (nextProps.district.id !== this.props.district.id)) {
      const { name, shortname, submarket } = nextProps.district
      this.setState({
        name,
        shortname,
        submarket,
      })
    }
  }

  render() {
    const { district, editing } = this.props
    const { showConfirmDialog, name, shortname, submarket } = this.state

    return (
      <div className={styles.form}>
        <div className={styles.formItem}>
          <label>Name:</label>
          {editing ?
            <input
              className={styles.input}
              value={name}
              onChange={(e) => this.setState({ name: e.target.value })}
            /> :
            <Typography className={styles.text} variant="body2">{district.name}</Typography>
          }
        </div>
        <div className={styles.formItem}>
          <label>Shortname:</label>
          {editing ?
            <input
              className={styles.input}
              value={shortname}
              onChange={(e) => this.setState({ shortname: e.target.value })}
            /> :
            <Typography className={styles.text} variant="body2">{district.shortname}</Typography>
          }
        </div>
        <div className={styles.formItem}>
          <label>Submarket:</label>
          <select
            value={submarket}
            onChange={(e) => this.setState({ submarket: e.target.value })}
          >
            {!isEmpty(district.submarkets) && district.submarkets.map((submarket) => (
              <option key={submarket.id} value={submarket.id}>{submarket.name}</option>
            ))}
          </select>
        </div>
        {editing ?
          <div className={styles.buttons}>
            <Button size="small" color="default" onClick={this.handleCancel}>Cancel</Button>
            <Button size="small" color="primary" onClick={this.handleSave}>Save</Button>
          </div> :
          <div className={styles.buttons}>
            <Button size="small" color="primary" onClick={this.handleEdit}>Edit</Button>
            <Button size="small" color="secondary" onClick={this.handleDelete}>Delete</Button>
          </div>
        }
        <ConfirmDialog
          title={`Delete ${district.name} ?`}
          content="This is an irreversible action. Please confirm."
          open={showConfirmDialog}
          handleClose={this.handleClose}
          handleConfirm={this.handleConfirm}
        />
      </div>
    )
  }

  handleEdit = () => {
    this.props.handleEdit()
  }

  handleCancel = () => {
    this.props.handleCancel()
  }

  handleClose = () => {
    this.setState({ showConfirmDialog: false })
  }

  handleSave = () => {
    this.props.handleSave()
    this.props.notify({
      message: 'Your changes have been saved!',
      status: 'success',
      position: 'tc',
    })
  }

  handleConfirm = () => {
    this.props.handleDelete()
    this.handleClose()
    this.props.notify({
      message: 'Delete Successful!',
      status: 'success',
      position: 'tc',
    })
  }

  handleDelete = () => {
    this.setState({
      showConfirmDialog: true,
    })
  }
}

const mapStateToProps = state => state

const mapDispatchToProps = {
  notify,
}

export default connect(mapStateToProps, mapDispatchToProps)(DistrictEditWindow)
