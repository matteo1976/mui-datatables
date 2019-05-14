import React from 'react';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Popover from './Popover';
import TableFilter from './TableFilter';
import TableViewCol from './TableViewCol';
import TableSearch from './TableSearch';
import SearchIcon from '@material-ui/icons/Search';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import PrintIcon from '@material-ui/icons/Print';
import AddIcon from '@material-ui/icons/Add';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import FilterIcon from '@material-ui/icons/FilterList';
import ReactToPrint from 'react-to-print';
import styled from '../styled';
import { createCSVDownload } from '../utils';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export const defaultToolbarStyles = (theme, props) => ({
  root: {},
  left: {
    flex: '1 1 auto',
  },
  actions: {
    flex: '1 1 auto',
    textAlign: 'right',
  },
  titleRoot: {},
  titleText: {},
  icon: {
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  iconActive: {
    color: theme.palette.primary.main,
  },
  filterPaper: {
    maxWidth: '50%',
  },
  searchIcon: {
    display: 'inline-flex',
    marginTop: '10px',
    marginRight: '8px',
  },
  ...(props.options.responsive ? { ...responsiveToolbarStyles(theme) } : {}),
});

export const responsiveToolbarStyles = theme => ({
  [theme.breakpoints.down('sm')]: {
    titleRoot: {},
    titleText: {
      fontSize: '16px',
    },
    spacer: {
      display: 'none',
    },
    left: {
      // flex: "1 1 40%",
      padding: '8px 0px',
    },
    actions: {
      // flex: "1 1 60%",
      textAlign: 'right',
    },
  },
  [theme.breakpoints.down('xs')]: {
    root: {
      display: 'block',
    },
    left: {
      padding: '8px 0px 0px 0px',
    },
    titleText: {
      textAlign: 'center',
    },
    actions: {
      textAlign: 'center',
    },
  },
  '@media screen and (max-width: 480px)': {},
});

class TableToolbar extends React.Component {
  state = {
    iconActive: null,
    showSearch: false,
    searchText: null,
    showModal: false,
    field: [],
  };

  componentDidMount() {
    this.setState({ data: this.props.data });
  }

  handleCSVDownload = () => {
    const { columns, options } = this.props;
    const { data } = this.state;
    createCSVDownload(columns, data, options);
  };

  setActiveIcon = iconName => {
    this.setState(() => ({
      showSearch: this.isSearchShown(iconName),
      iconActive: iconName,
    }));
  };

  isSearchShown = iconName => {
    let nextVal = false;
    if (this.state.showSearch) {
      if (this.state.searchText) {
        nextVal = true;
      } else {
        const { onSearchClose } = this.props.options;
        if (onSearchClose) onSearchClose();
        nextVal = false;
      }
    } else if (iconName === 'search') {
      nextVal = this.showSearch();
    }
    return nextVal;
  };

  getActiveIcon = (styles, iconName) => {
    return this.state.iconActive !== iconName ? styles.icon : styles.iconActive;
  };

  showSearch = () => {
    !!this.props.options.onSearchOpen && this.props.options.onSearchOpen();
    this.props.setTableAction('onSearchOpen');
    return true;
  };

  hideSearch = () => {
    const { onSearchClose } = this.props.options;

    if (onSearchClose) onSearchClose();
    this.props.searchTextUpdate(null);

    this.setState(() => ({
      iconActive: null,
      showSearch: false,
      searchText: null,
    }));

    this.searchButton.focus();
  };

  handleSearch = value => {
    this.setState({ searchText: value });
    this.props.searchTextUpdate(value);
  };

  handleOpenModal = () => {
    const { columns } = this.props;
    const field = columns.map(element => {
      return (
        <TextField
          autoFocus
          margin="dense"
          key={`${element.name}_${element.label}`}
          id={element.name}
          label={element.label}
          type="text" //TODO identify the type of colums data
          inputRef={el => (this[element.name] = el)}
          style={{ margin: '10px', width: '200px' }}
        />
      );
    });
    console.log(field);
    this.setState({ showModal: true, field: field });
  };

  handleAddRow = () => {
    const { columns, addNewRow } = this.props;

    const field = columns.map(element => {
      return this[element.name].value;
    });

    addNewRow(field);
    this.setState({ showModal: false });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const {
      options,
      classes,
      columns,
      filterData,
      filterList,
      filterUpdate,
      resetFilters,
      toggleViewColumn,
      title,
      tableRef,
    } = this.props;

    const { search, addRow, downloadCsv, print, viewColumns, filterTable } = options.textLabels.toolbar;
    const { showSearch, data } = this.state;

    return (
      <div>
        <Toolbar className={classes.root} role={'toolbar'} aria-label={'Table Toolbar'}>
          <div className={classes.left}>
            {showSearch === true ? (
              <TableSearch onSearch={this.handleSearch} onHide={this.hideSearch} options={options} />
            ) : typeof title !== 'string' ? (
              title
            ) : (
              <div className={classes.titleRoot} aria-hidden={'true'}>
                <Typography variant="h6" className={classes.titleText}>
                  {title}
                </Typography>
              </div>
            )}
          </div>
          <div className={classes.actions}>
            {options.search && (
              <Tooltip title={search}>
                <IconButton
                  aria-label={search}
                  buttonRef={el => (this.searchButton = el)}
                  classes={{ root: this.getActiveIcon(classes, 'search') }}
                  onClick={this.setActiveIcon.bind(null, 'search')}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            )}
            {options.download && (
              <Tooltip title={downloadCsv}>
                <IconButton aria-label={downloadCsv} classes={{ root: classes.icon }} onClick={this.handleCSVDownload}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            {options.addRow && (
              <Tooltip title={addRow}>
                <IconButton aria-label={addRow} classes={{ root: classes.icon }} onClick={this.handleOpenModal}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
            {options.print && (
              <Tooltip title={print}>
                <span>
                  <ReactToPrint
                    trigger={() => (
                      <IconButton aria-label={print} classes={{ root: classes.icon }}>
                        <PrintIcon />
                      </IconButton>
                    )}
                    content={() => this.props.tableRef()}
                  />
                </span>
              </Tooltip>
            )}
            {options.viewColumns && (
              <Popover
                refExit={this.setActiveIcon.bind(null)}
                trigger={
                  <IconButton
                    aria-label={viewColumns}
                    classes={{ root: this.getActiveIcon(classes, 'viewcolumns') }}
                    onClick={this.setActiveIcon.bind(null, 'viewcolumns')}>
                    <Tooltip title={viewColumns}>
                      <ViewColumnIcon />
                    </Tooltip>
                  </IconButton>
                }
                content={
                  <TableViewCol data={data} columns={columns} options={options} onColumnUpdate={toggleViewColumn} />
                }
              />
            )}
            {options.filter && (
              <Popover
                refExit={this.setActiveIcon.bind(null)}
                classes={{ paper: classes.filterPaper }}
                trigger={
                  <IconButton
                    aria-label={filterTable}
                    classes={{ root: this.getActiveIcon(classes, 'filter') }}
                    onClick={this.setActiveIcon.bind(null, 'filter')}>
                    <Tooltip title={filterTable}>
                      <FilterIcon />
                    </Tooltip>
                  </IconButton>
                }
                content={
                  <TableFilter
                    columns={columns}
                    options={options}
                    filterList={filterList}
                    filterData={filterData}
                    onFilterUpdate={filterUpdate}
                    onFilterReset={resetFilters}
                  />
                }
              />
            )}
            {options.customToolbar && options.customToolbar()}
          </div>
        </Toolbar>
        <Dialog open={this.state.showModal} onClose={this.handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To subscribe to this website, please enter your email address here. We will send updates occasionally.
            </DialogContentText>

            {this.state.field == [] ? null : this.state.field}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseModal} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleAddRow} color="primary">
              Subscribe
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default styled(TableToolbar)(defaultToolbarStyles, { name: 'MUIDataTableToolbar' });
