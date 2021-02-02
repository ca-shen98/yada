import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {connect} from 'react-redux';
import {setBackendModeSignedInStatusAction} from '../reducers/BackendModeSignedInStatus';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import DescriptionIcon from '@material-ui/icons/Description';
import Link from '@material-ui/core/Link';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import AmpStoriesIcon from '@material-ui/icons/AmpStories';
import {FILE_TYPE, checkNoOpenFileId} from '../util/FileIdAndTypeUtils';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import {handleSaveCurrentFileEditorContent} from './Editor';
import InputBase from '@material-ui/core/InputBase';
import { fade, withStyles, withstyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = theme => ({
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    },
  });

class Navbar extends React.Component {
    render = () => {
    const classes = this.props.styles;
    const noOpenFileIdCheck = checkNoOpenFileId(this.props.currentOpenFileId);
    return(
            <AppBar position="static" class="custom-navbar">
                <Toolbar>
                    <img className={"menuButton"} src={require('../images/logo.png')} style={{width: "40px", marginRight: "10px"}}/>
                    <Typography variant="h5" style={{fontFamily:"Bungee", color:"#F5F0E1"}}>
                        YADA
                    </Typography>
                    <div style={{flexGrow: 1, marginLeft: "150px"}}>
                        {this.props.currentOpenFileName.sourceName == '' ? null : 
                        <Breadcrumbs aria-label="breadcrumb" color="secondary" style={{marginRight: "10px", float: "left", border:"1px solid #F5F0E1", borderRadius: "10px", padding: "8px"}}>
                            <Link color="inherit" style={{ color: "#F5F0E1",}}> 
                            <DescriptionIcon color="secondary"/>
                                {this.props.currentOpenFileName.sourceName}
                            </Link>
                            {this.props.currentOpenFileName.viewName == '' ? null : 
                                <Link color="inherit" style={{color: "#F5F0E1"}}> 
                                {
                                    (this.props.currentOpenFileId.viewType === FILE_TYPE.CARD_VIEW) ? 
                                        <AmpStoriesIcon color="secondary"/>:
                                    (this.props.currentOpenFileId.viewType === FILE_TYPE.TEXT_VIEW) ?
                                        <TextFieldsIcon color="secondary"/> :
                                    null
                                }
                                {this.props.currentOpenFileName.viewName}
                                </Link>
                            }
                        </Breadcrumbs>
                        }
                        <Button
                        variant="outlined"
                        color="secondary"
                        title="save"
                        disabled={noOpenFileIdCheck || !this.props.saveDirtyFlag}
                        onClick={handleSaveCurrentFileEditorContent}
                        startIcon={<SaveIcon />}
                        style= {{ borderRadius: "10px",paddingTop: "8px", paddingBottom: "8px", float: "left", marginRight: "20px" }}
                        >
                            Save
                        </Button>
                        {
                            this.props.currentOpenFileName.viewName == '' ? 
                            <div style={{backgroundColor: "rgba(245, 240, 225, 0.8)", marginLeft: "250px", width: "50%", borderRadius: "10px", padding: "5px"}}>
                                <div style={{float: "left", marginTop: "3px"}}>
                                    <SearchIcon color="primary"/>
                                </div>
                                <InputBase
                                    placeholder="Search with Tags…"
                                    inputProps={{ 'aria-label': 'search' }}
                                    color="primary"
                                    style={{width: "90%"}}
                                />
                                <div style={{float: "right", marginTop: "3px"}}>
                                    <ClearIcon color="primary"/>
                                </div>
                            </div>
                            : null
                        }
                    </div>
                    <IconButton
                    edge="end"
                    aria-label="account of current user"
                    aria-haspopup="true"
                    color="inherit"
                    style={{float: "right"}}
                    >
                    <AccountCircleIcon color="secondary"/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            )
    }
}

export default connect(
    state => ({ currentOpenFileId: state.currentOpenFileId, currentOpenFileName: state.currentOpenFileName, backendModeSignedInStatus: state.backendModeSignedInStatus, saveDirtyFlag: state.saveDirtyFlag, styles: withStyles(useStyles) }),
    dispatch => ({
      dispatchSetBackendModeSignedInStatusAction: mode => dispatch(setBackendModeSignedInStatusAction(mode)),
    }),
  )(Navbar);