import React, { Component } from 'react'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import { isEmpty } from 'lodash'
import LoadingCircle from '../LoadingCircle'
import Logo from '../Logo'
import styles from './styles.module.less'

class SideDrawer extends Component {
  render() {
    const {
      selectedMarket,
      markets,
      handleSelectChange,
      loading,
    } = this.props

    return (
      <div className={styles.drawer}>
        <List>
          <ListItem>
            <Logo className={styles.logo} width={32} height={18} />
            <Typography variant="title">
              District Editor
            </Typography>
          </ListItem>
        </List>
        <Divider />
        <List className={styles.main}>
          <ListItem>
            <FormControl className={styles.select} disabled={markets.loading}>
              <Select
                value={selectedMarket}
                onChange={handleSelectChange}
                inputProps={{
                  name: 'Market',
                }}
              >
                {!isEmpty(markets.data) && markets.data.map((market) => (
                  <MenuItem key={market.id} value={market.id}>{market.name}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Market</FormHelperText>
            </FormControl>
          </ListItem>
          <ListItem classes={{ root: styles.loaderContainer }}>
            <LoadingCircle loading={loading} />
          </ListItem>
        </List>
      </div>
    )
  }
}

export default SideDrawer
