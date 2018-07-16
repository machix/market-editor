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
import { find } from 'lodash'
import InfoWindow from '../InfoWindow'

class SideDrawer extends Component {
  render() {
    const {
      selectedMarket,
      selectedDistrict,
      markets,
      market,
      handleSelectMarketChange,
      handleSelectDistrictChange,
      loading,
      handleEdit,
      handleCancel,
      handleSave,
      handleDelete,
      editing,
      showInfoWindow,
    } = this.props

    const districts = market && market.data.districts
    const district = market && find(market.data.districts, ['id', selectedDistrict])

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
            <FormControl className={styles.select} disabled={loading || isEmpty(markets.data)}>
              <Select
                value={selectedMarket}
                onChange={handleSelectMarketChange}
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
          <ListItem>
            <FormControl className={styles.select} disabled={loading || isEmpty(markets.data)}>
              {this.renderDistrictSelect({ selectedDistrict, handleSelectDistrictChange, districts })}
              <FormHelperText>District</FormHelperText>
            </FormControl>
          </ListItem>
          {(selectedDistrict || showInfoWindow) &&
            <div style={{ marginTop: '40px' }}>
              <Divider />
              <ListItem>
                {this.renderInfoWindow({ market, district, handleEdit, handleCancel, handleSave, handleDelete, editing, showInfoWindow })}
              </ListItem>
              <Divider />
            </div>
          }
          <ListItem classes={{ root: styles.loaderContainer }}>
            <LoadingCircle loading={loading} />
          </ListItem>
        </List>
      </div>
    )
  }

  renderDistrictSelect = ({ selectedDistrict, handleSelectDistrictChange, districts }) => {
    return (
      <Select
        value={selectedDistrict}
        onChange={handleSelectDistrictChange}
        inputProps={{
          name: 'District',
        }}
      >
        {!isEmpty(districts) && districts.map((district) => (
          <MenuItem key={district.id} value={district.id}>{district.name}</MenuItem>
        ))}
      </Select>
    )
  }

  renderInfoWindow = ({
    market,
    district,
    handleEdit,
    handleCancel,
    handleSave,
    handleDelete,
    editing,
    showInfoWindow,
  }) => {
    return (
      <InfoWindow
        editing={editing}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleSave={handleSave}
        handleDelete={handleDelete}
        market={market}
        district={district}
        showInfoWindow={showInfoWindow}
      />
    )
  }
}

export default SideDrawer
