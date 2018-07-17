import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import styles from './styles.module.less'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete'
import SaveIcon from '@material-ui/icons/Save'
import EditIcon from '@material-ui/icons/Edit'
import ConfirmDialog from '../ConfirmDialog'
import { notify } from 'reapop'

class InfoWindow extends Component {
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
    if (this.props.region) {
      const { name, shortname, submarket } = this.props.region
      this.setState({
        name,
        shortname,
        submarket,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.region) {
      const { name, shortname, submarket } = nextProps.region
      this.setState({
        name,
        shortname,
        submarket,
      })
    }
  }

  render() {
    const { market, editing } = this.props
    const {
      showConfirmDialog,
      name,
      shortname,
      submarket,
    } = this.state
    const { submarkets } = market.data

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
            <Typography className={styles.text} variant="body2">{name}</Typography>
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
            <Typography className={styles.text} variant="body2">{shortname}</Typography>
          }
        </div>
        <div className={styles.formItem}>
          <label>Submarket:</label>
          <select
            disabled={!editing}
            value={submarket}
            onChange={this.handleSelectSubmarketChange}
          >
            <option disabled key="submarket-placeholder" value="">-Select submarket-</option>
            {!isEmpty(submarkets) && submarkets.map((submarket) => (
              <option key={submarket.id} value={submarket.id}>{submarket.name}</option>
            ))}
          </select>
        </div>
        {editing ?
          <div className={styles.buttons}>
            <Button variant="outlined" size="small" color="default" onClick={this.handleCancel}>Cancel</Button>
            <Button variant="outlined" size="small" color="primary" onClick={this.handleSave}>
              <SaveIcon className={styles.icon} />
              Save
            </Button>
          </div> :
          <div className={styles.buttons}>
            <Button variant="outlined" size="small" color="primary" onClick={this.handleEdit}>
              <EditIcon className={styles.icon} />
              Edit
            </Button>
            <Button variant="outlined" size="small" color="secondary" onClick={this.handleDelete}>
              <DeleteIcon className={styles.icon} />
              Delete
            </Button>
          </div>
        }
        <ConfirmDialog
          title={`Delete ${name} ?`}
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
    if (this.props.region) {
      const { name, shortname, submarket } = this.props.region
      this.setState({
        name,
        shortname,
        submarket,
      })
    } else {
      this.setState({
        name: '',
        shortname: '',
        submarket: '',
      })
    }
    this.props.handleCancel()
  }

  handleClose = () => {
    this.setState({ showConfirmDialog: false })
  }

  handleSelectSubmarketChange = (e) => {
    this.setState({ submarket: e.target.value })
  }

  handleSave = () => {
    const { market } = this.props
    const {
      name,
      shortname,
      submarket,
    } = this.state
    if (!name || !shortname || !submarket) {
      this.props.notify({
        message: 'Please fill all form values!',
        status: 'error',
        position: 'tc',
      })
    } else {
      const formData = {
        market: market.data.id,
        name,
        shortname,
        submarket,
      }
      this.props.handleSave(formData)
    }
  }

  handleConfirm = () => {
    const { region } = this.props
    this.props.handleDelete(region.id).then(() => {
      this.handleClose()
      this.props.notify({
        message: 'Delete Successful!',
        status: 'success',
        position: 'tc',
      })
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

export default connect(mapStateToProps, mapDispatchToProps)(InfoWindow)
