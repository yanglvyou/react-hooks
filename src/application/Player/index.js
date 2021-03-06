import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen,
  changeSpeed
} from "./store/actionCreators";
import MiniPlayer from "./minPlayer/index";
import NormalPlayer from "./normalPlayer/index";
import { getSongUrl, isEmptyObject, shuffle, findIndex } from "../../api/utils";
import { getLyricRequest } from "../../api/request";
// import { set } from "immutable";
import Lyric from "../../api/lyric-parser";
import Toast from "../../baseUI/Toast/index";
import { playMode,list } from "../../api/config";
import PlayList from "./play-list/index";

function Player(props) {
  const {
    fullScreen,
    playing,
    currentIndex,
    currentSong: immutableCurrentSong,
    playList: immutablePlayList,
    mode, //播放模式
    sequencePlayList: immutableSequencePlayList, //顺序列表,
    speed,
  } = props;
  const {
    toggleFullScreenDispatch,
    togglePlayingDispatch,
    changeCurrentIndexDispatch,
    changeCurrentDispatch,
    togglePlayListDispatch,
    changeModeDispatch,
    changePlayListDispatch,
    changeSpeedDispatch
  } = props;

  const playList = immutablePlayList.toJS();
  const sequencePlayList = immutableSequencePlayList.toJS();
  // const currentSong = immutableCurrentSong.toJS();

  //记录当前的歌曲，以便下次重新渲染时对比是否是一首歌
  const [preSong, setPreSong] = useState({});
  const [modeText, setModeText] = useState("");
  const toastRef = useRef();

  const currentLyric=useRef();

  const [songReady, setSongReady] = useState(true);

  const [currentPlayingLyric,setPlayingLyric]=useState('');
  const currentLineNum=useRef(0);
  

  const changeMode = () => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      //顺序模式
      changePlayListDispatch(sequencePlayList);
      let index = findIndex(currentSong, sequencePlayList);
      changeCurrentIndexDispatch(index);
      setModeText("顺序模式");
    } else if (newMode === 1) {
      //单曲循环
      changePlayListDispatch(sequencePlayList);
      setModeText("单曲循环");
    } else if (newMode === 2) {
      //随机播放
      let newList = shuffle(sequencePlayList);
      let index = findIndex(currentSong, newList);
      changePlayListDispatch(newList);
      changeCurrentIndexDispatch(index);
      setModeText("随机播放");
    }
    changeModeDispatch(newMode);
    toastRef.current.show();
  };


  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.id ||
      !songReady
    )
      return;
    let current = playList[currentIndex];
    changeCurrentDispatch(current); //赋值currentSong
    setPreSong(current);
    audioRef.current.src = getSongUrl(current.id);
    audioRef.current.play().then(() => {
      setSongReady(true);
      //这里加上对播放速度的控制
      audioRef.current.playbackRate =speed;
    });
    togglePlayingDispatch(true); //播放状态
    getLyric(current.id);
    setCurrentTime(0);
    setDuration((current.dt / 1000) | 0); //时长
  }, [playList, currentIndex]);

  const clickSpeed=(newSpeed)=>{
    changeSpeedDispatch(newSpeed);
    //playbackRate为歌词播放速度，可修改
    audioRef.current.playbackRate=newSpeed;
    //同步歌词
    currentLyric.current.changeSpeed(newSpeed);
    currentLyric.current.seek(currentTime*1000);
  }
 
  const handleLyric=({lineNum,txt})=>{
    if(!currentLyric.current) return;
    currentLineNum.current=lineNum;
    setPlayingLyric(txt);
  }

  const getLyric=id=>{
    let lyric='';
    getLyricRequest(id).then(data=>{
      lyric=data.lrc.lyric;
      if(!lyric){
        currentLyric.current=null;
        return;
      }
      currentLyric.current=new Lyric(lyric,handleLyric);
      currentLyric.current.play ();
      currentLineNum.current = 0;
      currentLyric.current.seek (0);
    }).catch(()=>{
      songReady.current=true;
      audioRef.current.play();
    })
  }

  //目前播放时间
  const [currentTime, setCurrentTime] = useState(0);
  //歌曲总时长
  const [duration, setDuration] = useState(0);
  //歌曲播放进度
  const percent = isNaN(currentTime / duration) ? 0 : currentTime / duration;

  let currentSong = immutableCurrentSong.toJS();

  const clickPlaying = (e, state) => {
    e.stopPropagation();
    togglePlayingDispatch(state);
    if (currentLyric.current) {
      currentLyric.current.togglePlay (currentTime*1000);
    }
  };

  const audioRef = useRef();

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause();
  }, [playing]);

  const onProgressChange = curPercent => {
    const newTime = curPercent * duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
    if (!playing) {
      togglePlayingDispatch(true);
    }
    if (currentLyric.current) {
      currentLyric.current.seek(newTime * 1000);
    }
  };

  const updateTime = e => {
    setCurrentTime(e.target.currentTime);
  };

  //一首歌曲循环
  const handleLoop = () => {
    audioRef.current.currentTime = 0;
    changePlayingState(true);
    togglePlayingDispatch(true);
    audioRef.current.play();
  };

  const handlePrev = () => {
    //播放例表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex - 1;
    if (index < 0) index = playList.length - 1;

    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  };

  const handleNext = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex + 1;
    if (index === playList.length) index = 0;
    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  };

  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop();
    } else {
      handleNext();
    }
  };
  const handleError=()=>{
    alert ("播放出错");
  }

  return (
    <div>
      {isEmptyObject(currentSong) ? null : (
        <MiniPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          percent={percent}
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          togglePlayList={togglePlayListDispatch}
        />
      )}
      {isEmptyObject(currentSong) ? null : (
        <NormalPlayer
          mode={mode}
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          duration={duration}
          currentTime={currentTime}
          percent={percent}
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          onProgressChange={onProgressChange}
          handlePrev={handlePrev}
          handleNext={handleNext}
          changeMode={changeMode}
          togglePlayList={togglePlayListDispatch}
          currentLyric={currentLyric.current}
          currentPlayingLyric={currentPlayingLyric}
          currentLineNum={currentLineNum.current}
          speed={speed}
          clickSpeed={clickSpeed}
        />
      )}
      <PlayList></PlayList>
      <audio
        ref={audioRef}
        onTimeUpdate={updateTime}
        onEnded={handleEnd}
        onError={handleError}
      ></audio>
      <Toast text={modeText} ref={toastRef}></Toast>
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
  sequencePlayList: state.getIn(["player", "sequencePlayList"]),
  speed:state.getIn(['player','speed']),
  
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
    },
    changeSpeedDispatch(data){
      dispatch(changeSpeed(data))
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Player));
