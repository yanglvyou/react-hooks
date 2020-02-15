import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen
} from "./store/actionCreators";
import MiniPlayer from "./minPlayer/index";
import NormalPlayer from "./normalPlayer/index";

function Player(props) {
  const {
    fullScreen,
    playing,
    currentIndex,
    currentSong: immutableCurrentSong
  } = props;
  const {
    toggleFullScreenDispatch,
    togglePlayingDispatch,
    changeCurrentIndexDispatch,
    changeCurrentDispatch
  } = props;

  //目前播放时间
  const [currentTime, setCurrentTime] = useState(0);
  //歌曲总时长
  const [duration, setDuration] = useState(0);
  //歌曲播放进度
  const percent = isNaN(currentTime / duration) ? 0 : currentTime / duration;

  const currentSong = {
    al: {
      picUrl:
        "https://p1.music.126.net/JL_id1CFwNJpzgrXwemh4Q==/109951164172892390.jpg"
    },
    name: "木偶人",
    ar: [{ name: "薛之谦" }]
  };

//   let currentSong = immutableCurrentSong.toJS();

  const clickPlaying = (e, state) => {
    e.stopPropagation();
    togglePlayingDispatch(state);
  };

  return (
    <div>
      <MiniPlayer
        song={currentSong}
        fullScreen={fullScreen}
        playing={playing}
        clickPlaying={clickPlaying}
        toggleFullScreen={toggleFullScreenDispatch}
      ></MiniPlayer>
      <NormalPlayer
        song={currentSong}
        fullScreen={fullScreen}
        playing={playing}
        clickPlaying={clickPlaying}
        toggleFullScreen={toggleFullScreenDispatch}
      ></NormalPlayer>
    </div>
  );
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = state => ({
  fullScreen: state.getIn(["player", "fullScreen"]),
  playing: state.getIn(["player", "playing"]),
  currentSong: state.getIn(["player", "currentSong"]),
  showPlayList: state.getIn(["player", "showPlayList"]),
  mode: state.getIn(["player", "mode"]),
  currentIndex: state.getIn(["player", "currentIndex"]),
  playList: state.getIn(["player", "playList"]),
  sequencePlayList: state.getIn(["player", "sequencePlayList"])
});

// 映射 dispatch 到 props 上
const mapDispatchToProps = dispatch => {
  return {
    togglePlayingDispatch(data) {
      dispatch(changePlayingState(data));
    },
    toggleFullScreenDispatch(data) {
      dispatch(changeFullScreen(data));
    },
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data));
    },
    changeCurrentIndexDispatch(index) {
      dispatch(changeCurrentIndex(index));
    },
    changeCurrentDispatch(data) {
      dispatch(changeCurrentSong(data));
    },
    changeModeDispatch(data) {
      dispatch(changePlayMode(data));
    },
    changePlayListDispatch(data) {
      dispatch(changePlayList(data));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Player));