import React, { Component } from 'react'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
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
      selectedMarketId,
      selectedRegionId,
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
      region = market && find(market.data.districts, ['id', selectedRegionId])
    } else {
      regions = market && sortBy(market.data.starting_points, 'name')
      region = market && find(market.data.starting_points, ['id', selectedRegionId])
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
              <InputLabel>Market</InputLabel>
              <Select
                value={selectedMarketId}
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
              {selectedMarketId && (<FormHelperText><a href={`/nimda/doordash/market/${selectedMarketId}`}>Nimda Link</a></FormHelperText>)}
            </FormControl>
          </ListItem>
          <ListItem>
            <FormControl className={styles.select} disabled={loading || isEmpty(markets.data) || !selectedMarketId}>
              <InputLabel>{selectedTool === 'districtEditor' ? 'District' : 'Starting Point'}</InputLabel>
              {this.renderRegionSelect({ selectedRegionId, handleSelectRegionChange, regions })}
              {selectedRegionId && (
                <FormHelperText>
                  <a href={`/nimda/doordash/${selectedTool === 'districtEditor' ? 'district' : 'startingpoint'}/${selectedRegionId}`}>
                    Nimda Link</a>
                  </FormHelperText>
              )}
            </FormControl>
          </ListItem>
          {(selectedRegionId || showInfoWindow) &&
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

  renderRegionSelect = ({ selectedRegionId, handleSelectRegionChange, regions }) => {
    return (
      <Select
        value={selectedRegionId}
        onChange={handleSelectRegionChange}
        inputProps={{
          name: 'District',
        }}
      >
        {!isEmpty(regions) && regions.map((region) => (
          <MenuItem key={region.id} value={region.id}>
            <div className={styles.regionSelectColor} style={{ 'backgroundColor': (region.html_color) }}></div>
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
