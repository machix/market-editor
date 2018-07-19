import React, { Component } from 'react'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import { isEmpty, find, sortBy } from 'lodash'
import LoadingCircle from '../LoadingCircle'
import Logo from '../Logo'
import styles from './styles.module.less'
import InfoWindow from '../InfoWindow'
import classnames from 'classnames'

class SideDrawer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }
  render() {
    const {
      selectedMarket,
      selectedRegion,
      selectedTool,
      markets,
      market,
      handleSelectMarketChange,
      handleSelectRegionChange,
      handleSelectToolChange,
      loading,
      handleEdit,
      handleCancel,
      handleSave,
      handleDelete,
      editing,
      showInfoWindow,
    } = this.props

    let regions
    let region

    if (selectedTool === 'districtEditor') {
      regions = market && sortBy(market.data.districts, 'name')
      region = market && find(market.data.districts, ['id', selectedRegion])
    } else {
      regions = market && sortBy(market.data.starting_points, 'name')
      region = market && find(market.data.starting_points, ['id', selectedRegion])
    }

    return (
      <div className={styles.drawer}>
        <List>
          <ListItem>
            <FormControl classes={{ root: styles.selectRoot }} className={styles.select} disabled={loading}>
              <Select
                value={selectedTool}
                onChange={handleSelectToolChange}
              >
                <MenuItem key="districtEditor" value="districtEditor">
                  <div className={styles.title}>
                    <Logo className={styles.logo} width={32} height={18} />
                    <Typography variant="title">
                      District Editor
                    </Typography>
                  </div>
                </MenuItem>
                <MenuItem className={styles.title} key="startingPointEditor" value="startingPointEditor">
                  <div className={styles.title}>
                    <Logo className={styles.logo} width={30} height={16} />
                    <Typography variant="title">
                      Starting Point Editor
                    </Typography>
                  </div>
                </MenuItem>
              </Select>
            </FormControl>
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
                {!isEmpty(markets.data) && sortBy(markets.data, 'name').map((market) => (
                  <MenuItem key={market.id} value={market.id}>
                    <span className={classnames(!market.is_active ? styles.inactive : '')}>
                      {market.name}
                    </span>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Market</FormHelperText>
            </FormControl>
          </ListItem>
          <ListItem>
            <FormControl className={styles.select} disabled={loading || isEmpty(markets.data) || !selectedMarket}>
              {this.renderRegionSelect({ selectedRegion, handleSelectRegionChange, regions })}
              <FormHelperText>{selectedTool === 'districtEditor' ? 'District' : 'Starting Point'}</FormHelperText>
            </FormControl>
          </ListItem>
          {(selectedRegion || showInfoWindow) &&
            <div style={{ marginTop: '40px' }}>
              <Divider />
              <ListItem>
                {this.renderInfoWindow({ market, region, handleEdit, handleCancel, handleSave, handleDelete, editing, showInfoWindow, selectedTool })}
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

  renderRegionSelect = ({ selectedRegion, handleSelectRegionChange, regions }) => {
    return (
      <Select
        value={selectedRegion}
        onChange={handleSelectRegionChange}
        inputProps={{
          name: 'District',
        }}
      >
        {!isEmpty(regions) && regions.map((region) => (
          <MenuItem key={region.id} value={region.id}>
            <span className={classnames(region.is_active === false ? styles.inactive : '')}>
              {region.name}
            </span>
          </MenuItem>
        ))}
      </Select>
    )
  }

  renderInfoWindow = ({
    market,
    region,
    handleEdit,
    handleCancel,
    handleSave,
    handleDelete,
    editing,
    showInfoWindow,
    selectedTool,
  }) => {
    return (
      <InfoWindow
        editing={editing}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleSave={handleSave}
        handleDelete={handleDelete}
        market={market}
        region={region}
        showInfoWindow={showInfoWindow}
        selectedTool={selectedTool}
      />
    )
  }
}

export default SideDrawer
