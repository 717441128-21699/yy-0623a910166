export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/pending/index',
    'pages/checkin/index',
    'pages/mine/index',
    'pages/gameDetail/index',
    'pages/createGame/index',
    'pages/reviewApply/index',
    'pages/playerApply/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#7B2CBF',
    navigationBarTitleText: '剧本站',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#7B2CBF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '车队'
      },
      {
        pagePath: 'pages/pending/index',
        text: '待处理'
      },
      {
        pagePath: 'pages/checkin/index',
        text: '签到'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
