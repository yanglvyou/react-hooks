import * as actionTypes from "./constants";
import { fromJS } from "immutable";
import { playMode } from "../../../api/config";
import { findIndex } from "../../../api/utils";

const handleInsertSong = (state, song) => {
  const playList = JSON.parse(JSON.stringify(state.get("playList").toJS()));
  console.log("playList: ", playList);
  const sequenceList = JSON.parse(
    JSON.stringify(state.get("sequencePlayList").toJS())
  );
  console.log("sequenceList: ", sequenceList);
  let currentIndex = state.get("currentIndex");
  //看看有没有同款歌曲
  let fpIndex = findIndex(song, playList);
  console.log("fpIndex: ", fpIndex);
  //如果是当前歌曲直接不处理
  if (fpIndex === currentIndex && currentIndex !== -1) return state;
  currentIndex++;
  console.log('currentIndex: ', currentIndex);
  //把歌曲放进去，放到当前歌曲的下一个位置
  playList.splice(currentIndex, 0, song);
  //如果列表已经存在要添加的歌曲
  if (fpIndex > -1) {
    if (currentIndex > fpIndex) {
      playList.splice(fpIndex, 1);
      currentIndex--;
    } else {
      playList.splice(fpIndex + 1, 1);
    }
  }

  //同理，处理sequenceList
  let sequenceIndex = findIndex(playList[currentIndex], sequenceList) + 1;
  console.log('sequenceIndex: ', sequenceIndex);
  let fsIndex = findIndex(song, sequenceList);
  console.log('fsIndex: ', fsIndex);
  //插入歌曲
  sequenceList.splice(sequenceIndex, 0, song);
  // 插入歌曲
  if (fsIndex > -1) {
    //跟上面类似的逻辑。如果在前面就删掉，index--;如果在后面就直接删除
    if (sequenceIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1);
      sequenceIndex--;
    } else {
      sequenceList.splice(fsIndex + 1, 1);
    }
  }
  return state.merge({
    playList: fromJS(playList),
    sequencePlayList: fromJS(sequenceList),
    currentIndex: fromJS(currentIndex)
  });
};

const handleDeleteSong = (state, song) => {
  //深拷贝
  const playList = JSON.parse(JSON.stringify(state.get("playList").toJS()));
  const sequenceList = JSON.parse(
    JSON.stringify(state.get("sequencePlayList").toJS())
  );
  let currentIndex = state.get("currentIndex");
  const fpIndex = findIndex(song, playList);
  playList.splice(fpIndex, 1);
  //如果删除的歌曲排在当前播放歌曲前面，currentIndex--,让歌曲正常播放
  if (fpIndex < currentIndex) currentIndex--;

  //sequenceList中直接删除
  const fsIndex = findIndex(song, sequenceList);
  sequenceList.splice(fsIndex, 1);

  return state.merge({
    playList: fromJS(playList),
    sequencePlayList: fromJS(sequenceList),
    currentIndex: fromJS(currentIndex)
  });
};

const defaultState = fromJS({
  fullScreen: false, // 播放器是否为全屏模式
  playing: false, // 当前歌曲是否播放
  sequencePlayList: [], // 顺序列表 (因为之后会有随机模式，列表会乱序，因从拿这个保存顺序列表)
  playList: [],
  mode: playMode.sequence, // 播放模式
  currentIndex: -1, // 当前歌曲在播放列表的索引位置
  showPlayList: false, // 是否展示播放列表
  currentSong: {}
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_SONG:
      return state.set("currentSong", action.data);
    case actionTypes.SET_FULL_SCREEN:
      return state.set("fullScreen", action.data);
    case actionTypes.SET_PLAYING_STATE:
      return state.set("playing", action.data);
    case actionTypes.SET_SEQUECE_PLAYLIST:
      return state.set("sequencePlayList", action.data);
    case actionTypes.SET_PLAYLIST:
      return state.set("playList", action.data);
    case actionTypes.SET_PLAY_MODE:
      return state.set("mode", action.data);
    case actionTypes.SET_CURRENT_INDEX:
      return state.set("currentIndex", action.data);
    case actionTypes.SET_SHOW_PLAYLIST:
      return state.set("showPlayList", action.data);
    case actionTypes.DELETE_SONG:
      return handleDeleteSong(state, action.data);
    case actionTypes.INSERT_SONG:
      return handleInsertSong(state, action.data);
    default:
      return state;
  }
};
