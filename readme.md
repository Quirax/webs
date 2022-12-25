# 웹 브로드캐스팅 시스템

Web Broadcasting System

-   2022년 서울과학기술대학교 컴퓨터공학과 캡스톤디자인
-   [첨부된 도표 목록](https://imgur.com/a/1Qc2pgt)

## 실행 화면

아래 환경에서 [실행 방법](#실행-방법) 문단의 설명에 따라 실행한 화면입니다.

-   운영 환경 (서버)
    -   Intel Core i5-6500 @ 3.20 GHz / 32GB
    -   Windows 11 Pro 21H2 (x64)
        -   [Windows Subsystem for Linux 2](https://learn.microsoft.com/ko-kr/windows/wsl/)
            -   [Ubuntu 20.04.5 LTS](https://ubuntu.com/wsl)
                -   [Docker v4.15.0](https://www.docker.com/)
-   테스트 환경: 학교 내 컴퓨터

[![실행 화면](http://img.youtube.com/vi/YI3J6hzET9w/0.jpg)](https://youtu.be/YI3J6hzET9w)

### 실행 방법

~~추후 작성 예정~~

#### 주의 및 참고사항

1. DB 데이터는 docker volume 기능을 이용하여 반드시 별도의 저장소에 보관할 것을 권장합니다. 별도 저장소를 이용하지 않을 경우, DB container를 교체할 때 기존의 데이터가 소실될 수 있습니다.

## 배경

지금은 수많은 사람들이 인터넷으로 방송을 하는 시대입니다.
아프리카TV의 경우 2010년대 초반부터, 트위치나 유튜브는 2010년대 후반부터 활성화되었습니다.
한 때 UCC 열풍과 함께 유튜버가 대두되면서 인터넷 방송인과 구분되는 듯했으나,
현재는 유튜버가 실시간 방송을 하거나 인터넷 방송인이 방송 후 그 녹화본을 유튜브에 업로드하는 등 그 구분이 모호합니다.
특히, 키즈나 아이(Kizuna Ai)를 시작으로 버추얼 유튜버(Virtual Youtuber) 시장이 활성화되면서 인터넷 방송 시장은 더욱 커질 것으로 예상됩니다.

인터넷 방송은 방송인의 PC에서 실시간 스트림을 생성해 방송 플랫폼의 서버로 전송하면,
서버에서는 해당 스트림을 시청자들에게 배포하고, 시청자들은 해당 스트림을 받아 시청하는 구조로 진행됩니다.
이 때, 웹캠이나 컴퓨터 화면 등으로부터 화면을 합성하고 그로부터 실시간 영상 스트림을 생성하여 서버에 전송해 줄 프로그램이 필요합니다.
이를 송출 프로그램이라고 부릅니다.
대표적으로 OBS나 XSplit, Twitch Studio가 있습니다.

그러나 이들 송출 프로그램에는 분명한 한계가 존재합니다.
이에 본 프로젝트는 방송 입문자부터 일반 사용자들이 쓰기 적합한 수준의 방송 기능을 구현하는 것을 목표로,
전문적인 프로그램에 준하는 커스터마이징이 가능하면서 동시에 직관적인 UI/UX를 적용한 웹 어플리케이션 형태의 송출 프로그램을 개발하고자 하였습니다.
또한 웹앱으로 구현하되 반응형 웹 디자인을 적용하는 한편, 방송 설정을 웹 서버에 저장하고 동기화함으로써,
웹 브라우저를 사용할 수 있는 어떤 플랫폼에서도 똑같은 방송 설정으로 방송이 가능하게 하고자 하였습니다.

## 동작 원리

### 전체 시스템 구조

![전체 시스템 구조](https://i.imgur.com/b0xDAPa.jpg)

본 프로젝트는 다음과 같은 서버들로 구성된 서버-클라이언트 구조를 채택하고 있습니다.

-   프론트엔드(웹 서버): React.js 기반 웹 사이트
-   백엔드
    -   웹앱 서버: Node.js 기반
    -   Web2Stream 서버: Node.js 및 FFmpeg 기반; 장면을 영상으로 변환해 방송 플랫폼에 전달
    -   DB 서버: MongoDB 기반

시스템 간의 통신은 REST API를 기반으로 하며, 특히 프론트엔드와 백엔드 간에는 socket.io 기반의 WebSocket을 이용합니다.

### Data-Flow Diagram

![Data-Flow Diagram (로그인~장면 변경)](https://i.imgur.com/Tv3mqO7.jpg)
![Data-Flow Diagram (장면 변경 ~ 송출)](https://i.imgur.com/Mn1kcfK.jpg)

사용자가 Twitch OAuth API를 이용하여 로그인하면, 데이터베이스에서 사용자 정보를 가져와 방송 정보를 로드합니다.
사용자가 방송 정보(장면 등)를 변경하면 서버와 실시간으로 동기화됩니다.

서버에서는 송출용 페이지를 구성, 클라이언트에서 구성한 방송 화면을 재구현합니다.
이 때 클라이언트와 송출용 페이지와의 동기화를 아래와 같이 진행합니다.
(자세한 내용은 [송출용 페이지와의 동기화 문단](#송출용-페이지와의-동기화)을 참조 바랍니다.)

-   화면 및 웹캠은 WebRTC 프로토콜을 통해 공유받습니다.
-   웹 브라우저 소스에서 표시하는 웹 페이지 영상은 서버로부터 실시간 영상을 HLS 프로토콜에 따라 공유받습니다.
-   동영상으로 구현되는 소스(동영상, 화면 공유, 웹캠, 웹 브라우저 등)는 각종 제어(재생, 정지 등)를 서버를 통해 동기화합니다.

송출용 페이지에 표시되는 것들은 FFmpeg에 의해 영상으로 변환되어 RTMP 프로토콜을 따라 트위치 스트리밍 서버로 전송됩니다.
이 송출 구조에 대한 자세한 내용은 [Web2Stream 시스템 문단](#web2stream-시스템)을 참조 바랍니다.

### Class Diagram

![BroadcastInfo의 Class Diagram](https://i.imgur.com/mtOZBG5.jpg)

BroadcastInfo는 다음 요소들로 구성됩니다.

-   멤버 변수
    -   장면 및 장면 전환 정보들을 담은 객체
    -   현재 선택된 장면 및 장면 전환 등을 가리키는 포인터
    -   방송 정보: 방송 제목 및 카테고리
-   메소드
    -   실제 방송 전환 효과를 구현하는 메소드
    -   장면 선택 메소드
    -   장면 전환 선택 메소드

다이어그램에서 Overlay 객체의 metadata 멤버 변수 및 Transition 객체의 params 멤버 변수는 각각 오버레이와 장면 전환 효과의 설정에 필요한 각종 파라미터들입니다.
각 종류별로 필요한 파라미터들이 다르며, 종류별로 별도 구현하였습니다. 이에 대한 자세한 내용은 [이 문서](overlay_and_transition_list.md)를 참조 바랍니다.
한편, 각 오버레이의 변형(위치 및 크기 조절, 회전 등)은 Transform 객체로 저장되게 하였습니다.

### Web2Stream 시스템

본 프로젝트에서는 초기에는 실시간 스트림 생성을 위해 WebRTC를 이용해 클라이언트에서 구성한 방송 화면을 서버에 직접 전송하는 방향으로 기획하였습니다.
이를 위해 클라이언트에 Canvas 객체를 구현하고 여기에 방송 화면을 다시 그리는 방법을 고안하였습니다.
그러나 이는 웹 페이지의 특정 요소를 처음부터 다시 그리는 것과 같기 때문에, 최소 30fps를 구현하는 것도 클라이언트에게는 매우 큰 부담이 되었습니다.
이로 인해 다음과 같은 문제가 발생하였습니다.

-   클라이언트 측에서 성능이 저하
-   방송 스트림이 불안정해질 가능성 (frame-drop, 서버와의 연결 중단 등)
-   특히 모바일에서는 처리하기 매우 버거운 문제

그래서 아래 그림과 같이 서버에서 송출용 페이지를 열어서 이 화면을 동영상 스트림으로 변환하는 방법을 고안하였습니다.

![Web2Stream의 개략적인 원리](https://i.imgur.com/ZndRI1e.jpg)

다행스럽게도 [Sebastian Pereyro가 고안한 방법](https://docs.google.com/presentation/d/1b-HvxKmeFYE3qoNDJDHfbgVwEbi0QgmTvpH8w4CK5Tw)이 존재하였습니다.
그는 headless 모드로 Chrome을 실행하여 대상 페이지를 연 다음, 그로부터 영상 및 음성 스트림을 추출하여 실시간 스트림을 생성해 스트리밍 서버에 전송하는 방식을 사용하였습니다.
영상 추출에는 Chrome DevTools Protocol의 screencast API를 이용하고, 음성 추출에는 PulseAudio를 이용하였습니다.
이를 FFmpeg를 이용하여 조합한 뒤 실시간 스트림으로 변환하여 전송하는 형태로 구현되어 있습니다.
실제 그가 공유한 [repository](https://bitbucket.org/goempirical/bullman/src/master/)에는
이러한 기능들이 포함된 엔진과 이 엔진을 구동하고 작업을 관리하는 Node.js 기반 웹 서버가 구현되어 있습니다.
본 프로젝트에서는 해당 구현물에서 음성 스트림 추출과 작업 관리 기능을 사용하였습니다.
다만 Docker 이미지 기반으로 재구성하는 과정에서 발생한 문제들이 있어 이를 해결하였습니다.

한편 Prasana는 [Chrome DevTools Protocol의 Screencast API](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-startScreencast)를 이용,
웹 페이지 화면으로부터 실시간 영상 스트림을 추출하여 FFmpeg을 이용해 영상 파일 등으로 변환하는
[Node.js 라이브러리](https://github.com/prasanaworld/puppeteer-screen-recorder)를 개발하였습니다.
이에 본 프로젝트에선 상기한 엔진 부분에서 해당 라이브러리를 이용하도록 수정하되,
RTMP 변환을 위해 필요한 메소드를 overriding하여 별도로 제작함으로써
영상 스트림 추출과 실시간 스트림으로 변환하는 부분을 구현하였습니다.

또한 이 방법을 사용하면서 발생하는 다음의 몇가지 문제들을 해결하였으며,
그 외에 출력 실시간 스트림의 framerate 등 여러 변수들을 fine-tuning하였습니다.

-   문제: Screencast API를 통해 추출되는 영상 스트림이 framerate가 가변적이어서 실시간 스트림 변환 시 성능이 크게 저하되는 문제
    -   해결: framerate가 떨어질 때 강제로 frame을 중복 생성하도록 하여 framerate의 하한선을 보장
-   문제: 대상 웹 페이지에서 별도의 오디오 출력이 없을 경우 PulseAudio가 음성 스트림을 받아오지 못하는 문제
    -   해결: 대상 웹 페이지를 열기 전에 [묵음 영상(muted video)](https://youtube.com/watch?v=g4mHPeMGTJM)을 재생

한편 실시간 스트림으로 변환될 송출용 페이지의 경우,
클라이언트 UI에서 송출 화면을 제외한 나머지 부분을 제거함으로써 간단하게 구현하였습니다.

이렇게 최종 구현된 시스템의 구조는 아래 그림과 같습니다.
실제 테스트 결과 서버 사양 등의 문제로 degradation 문제는 있을 수 있으나 기능 자체는 정상적으로 동작함을 확인하였습니다.

![Web2Stream 전체 시스템 구조도](https://i.imgur.com/Sk1X0Rj.jpg)

### 송출용 페이지와의 동기화

송출용 페이지 제작 과정에서 클라이언트 페이지와 송출용 페이지의 동기화 문제가 발생하였습니다.
클라이언트에서 오버레이를 조작하거나 장면을 전환할 때, 클라이언트로부터 웹캠이나 화면 공유 스트림을 전달받을 때,
클라이언트에서 동영상 오버레이를 제어(재생, 종료, 볼륨 조절, 재생 위치 조절 등)할 때 등
각종 이벤트들이 송출용 페이지에서도 똑같이 동시에 구현되어야 했습니다.

![클라이언트와 송출용 페이지의 동기화 구조](https://i.imgur.com/QmseB9i.jpg)

위의 그림과 같이 클라이언트 페이지와 송출용 페이지 사이의 동기화를 구현하였습니다.
먼저 클라이언트와 송출용 페이지(/preview)는 방송 정보 객체가 갱신될 때마다 이를 지속적으로 전달받습니다.
실제 송출 화면은 이 방송 정보 객체를 기반으로 자동으로 구성하므로,
오버레이 조작이나 장면 전환 등 방송 정보 객체가 바뀌는 경우에는 이 방송 정보 객체를 동기화함으로써 해결하였습니다.
동기화 과정에서 데이터베이스에 실시간 저장이 가능하도록 구현하였습니다.

한편 동영상 제어의 경우에는 클라이언트에서 해당 제어가 발생될 때 그 제어 신호를 서버를 통해 송출용 페이지로 전달하여,
송출용 페이지에서 똑같이 제어하도록 하여 구현하였습니다.

웹캠이나 화면 공유의 경우에는 클라이언트와 송출용 페이지를 WebRTC를 이용하여 연결하고,
이 WebRTC 채널을 통해 해당 스트림을 전송함으로써 해결하였습니다.

### 웹 브라우저 오버레이 구현

본 프로젝트에서는 초기 기획 당시 웹 브라우저 오버레이 구현을 위해 iframe을 이용하고자 하였습니다.
그러나 제대로 표시되지 않고 console에 오류가 표시되는 현상이 발생하였습니다.

그 원인은 크게 다음의 2가지로 요약할 수 있습니다.

1. [Cross-Origin Resource Sharing](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS)
   : 한 출처에서 실행 중인 웹 애플리케이션이 다른 출처의 선택한 자원에 접근할 수 있는 권한을 부여하도록 브라우저에 알려주는 체제.
   브라우저는 스크립트에서 시작한 교차 출처 HTTP 요청을 제한함으로써 다른 출처에 무단으로 접근하여 발생하는 보안 문제들을 해결합니다.
2. [X-Frame-Options 헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
   : 해당 페이지를 `<frame>` 또는 `<iframe>`, `<object>`에서 렌더링할 수 있는지 여부를 결정하는 헤더.
   이 헤더가 활성화되어 있으면 사이트 내 콘텐츠들이 다른 사이트에 포함되지 않도록 합니다.
   특히 click-jacking 공격을 방지하기 위해 권장되고 있으며, 그 외에 다른 사이트에서 자사 사이트의 콘텐츠를 도용하는 것을 막는 데에도 사용됩니다.

그러나 이러한 브라우저 제약은 웹 브라우저 콘텐츠를 받아와야 하는 웹 브라우저 오버레이 구현에는 심각한 걸림돌이 되었습니다.
이에 아래 그림과 같이 Web2Stream에 HLS 출력 기능을 추가하고, 이를 클라이언트 및 송출용 페이지에서 표시함으로써 우회적으로 구현하였습니다.

![웹 브라우저 오버레이 구현 순서도](https://i.imgur.com/yCegs3b.jpg)

먼저 클라이언트에서 송출 요청을 서버에 보내면 서버에서 Web2Stream의 작업 관리 서버로 요청을 전달합니다.
Web2Stream의 송출 프로그램 엔진을 시작하면 엔진에서 해당 페이지로부터 실시간 스트림을 추출하여 HLS로 출력합니다.
HLS 출력은 segmentation 방식이므로, 이에 따라 m3u8 playlist 파일과 각 segmentation 파일(.ts)이 생성됩니다.
이 파일들을 주 서버를 거쳐 작업 관리 서버에서 제공하고, 클라이언트에서 이를 표시하도록 하였습니다.

다만 아래와 같은 문제가 있었습니다.

-   Web2Stream 엔진 실행에 다소간의 시간이 걸려 이를 대기하는 시간이 필요했고,
    따라서 오버레이 추가 이후 20초 후부터 클라이언트에 표시되는 제약이 발생하였습니다.
-   방송 송출과 웹 브라우저 오버레이 송출이 동시에 진행되는 바
    별도의 GPU가 없는 서버의 제원으로는 감당하기 어려워 버벅임 등의 문제가 심하게 발생하였습니다.

그럼에도 불구하고, 본 프로젝트는 브라우저 제약을 넘어 웹 브라우저 오버레이를 구현하였다는 것에 의의가 있다고 판단하였으며,
웹 브라우저 오버레이의 구현이 가능하다는 것이 확인된 이상
서버에 GPU를 추가하는 등 업그레이드 과정을 거치거나 다른 구현 방법을 이용한다면
더 좋은 성능의 오버레이 구현이 가능할 것이라고 예상합니다.

### 사용 라이브러리

-   React.js
    -   [react-moveable](https://www.npmjs.com/package/@voyagerx/react-moveable)
    -   [react-textarea-autosize](https://www.npmjs.com/package/react-textarea-autosize)
    -   [react-spring](https://react-spring.dev/docs)
    -   [react-autosuggest](https://github.com/moroshko/react-autosuggest)
    -   [react-dnd](https://react-dnd.github.io/react-dnd/about)
    -   [react-hls-player](https://www.npmjs.com/package/react-hls-player)
-   Nginx
-   [Docker](https://codechacha.com/ko/dockerizing-react-with-nginx/)
-   [Sass](https://velog.io/@sky/React-%EB%A6%AC%EC%95%A1%ED%8A%B8%EC%97%90-Sass-%EC%97%B0%EA%B2%B0%ED%95%98%EA%B8%B0)
-   [Font Awesome for React](https://fontawesome.com/v5/docs/web/use-with/react)
-   Socket.IO
-   Mongo DB
    -   [Mongoose](https://mongoosejs.com/docs/guide.html)
-   [Live Streaming with headless Chrome](https://docs.google.com/presentation/d/1b-HvxKmeFYE3qoNDJDHfbgVwEbi0QgmTvpH8w4CK5Tw/edit#slide=id.gc6f90357f_0_0)
-   [Puppeteer-Screen-Recorder](https://github.com/prasanaworld/puppeteer-screen-recorder)
-   [FFmpeg](https://www.ffmpeg.org/documentation.html)
    -   [fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg)
-   [Fetch](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch)
    -   [node-fetch](https://velog.io/@ahn0min/Node.js-fetch-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)

### 참고자료

-   [Javascript](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference)
    -   [How can I merge properties of two JavaScript objects dynamically?](https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically)
    -   [RGB to hex and hex to RGB](https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb)
    -   [얉은 복사(Shallow Copy), 깊은 복사(Deep Copy) 그리고 React의 리렌더링](https://velog.io/@jellybrown/ReactJS-얉은-복사Shallow-Copy-깊은-복사Deep-Copy-그리고-React의-리렌더링)
    -   [no-throw-literal](https://eslint.org/docs/latest/rules/no-throw-literal)
    -   [간단하게 난수화 문자열 생성하기[JS]](https://velog.io/@awesomelon/간단하게-난수화-문자열-생성하기)
    -   [열거형 Enum](https://sewonzzang.tistory.com/28)
    -   [Uncaught TypeError: (intermediate value)(...) is not a function](https://stackoverflow.com/questions/42036349/uncaught-typeerror-intermediate-value-is-not-a-function)
    -   [Array 원소 삭제](https://dgkim5360.tistory.com/entry/deleting-an-item-in-array-javascript)

#### User Interface and User Experiences

-   React
    -   JSX
        -   [Dynamic tag name in React JSX](https://stackoverflow.com/questions/33471880/dynamic-tag-name-in-react-jsx)
        -   [Passing object as props to jsx](https://stackoverflow.com/questions/49081549/passing-object-as-props-to-jsx)
        -   [How to set iframe content of a react component](https://stackoverflow.com/questions/34743264/how-to-set-iframe-content-of-a-react-component)
    -   [이벤트 처리하기](https://ko.reactjs.org/docs/handling-events.html)
    -   [HTML dataset 사용하기](https://velog.io/@hwang-eunji/React-HTML-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%84%B8%ED%8A%B8dataset-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)
    -   [react-spring/On Animation Finish Callback](https://github.com/pmndrs/react-spring/issues/19)
    -   [react-dnd/Tips and Tricks](https://channel.io/ko/blog/react-dnd-tips-tricks)
-   CSS
    -   [수평/수직 중앙 정렬](https://poiemaweb.com/css3-centering)
    -   [트랜스폼](https://poiemaweb.com/css3-transform)
    -   [CSS Triangle](https://css-tricks.com/snippets/css/css-triangle/)
    -   [Naver D2 - flexbox로 만들 수 있는 10가지 레이아웃](https://d2.naver.com/helloworld/8540176)
    -   [Maintain the aspect ratio of a div with CSS](https://stackoverflow.com/questions/1495407/maintain-the-aspect-ratio-of-a-div-with-css)
    -   [border-style](https://developer.mozilla.org/ko/docs/Web/CSS/border-style)
    -   [How to make borders collapse (on a div)?](https://stackoverflow.com/questions/17915865/how-to-make-borders-collapse-on-a-div)
    -   [pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events)
    -   Sass
        -   [SCSS/SASS 문법 정리](https://soooprmx.com/scsssass-%eb%ac%b8%eb%b2%95-%ec%a0%95%eb%a6%ac/)
        -   [SCSS/SASS - Maps](https://sass-lang.com/documentation/values/maps)
        -   [StackOverflow - Can I use the ampersand in SASS to reference specific tags with the parent class?](https://stackoverflow.com/questions/15796380/can-i-use-the-ampersand-in-sass-to-reference-specific-tags-with-the-parent-class)
        -   [Sass: Lists](https://sass-lang.com/documentation/values/lists)
        -   [Error: Node Sass does not yet support your current environment](https://jolly-sally.tistory.com/43)
-   [Element](https://developer.mozilla.org/ko/docs/Web/HTML/Element)
    -   [input type="radio"](https://developer.mozilla.org/ko/docs/Web/HTML/Element/Input/radio)
    -   [HTML5 input type range show range value](https://stackoverflow.com/questions/10004723/html5-input-type-range-show-range-value)
    -   [input type="color"](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color)
    -   [datalist](https://developer.mozilla.org/ko/docs/Web/HTML/Element/datalist)
    -   [details](https://developer.mozilla.org/ko/docs/Web/HTML/Element/details)
    -   Event
        -   [click](https://developer.mozilla.org/ko/docs/Web/API/Element/click_event)
            -   [Capture Right Click on HTML DIV](https://stackoverflow.com/questions/1093065/capture-right-click-on-html-div)
        -   [dblclick](https://developer.mozilla.org/en-US/docs/Web/API/Element/dblclick_event)
        -   [HTMLDetailsElement: toggle](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDetailsElement/toggle_event)
    -   [input disabled](http://www.tcpschool.com/html-tag-attrs/input-disabled)
    -   [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
        -   [How to detect a click event on a cross-domain iframe](https://gist.github.com/jaydson/1780598)
        -   [iframe과 통신하기](https://www.zerocho.com/category/HTML&DOM/post/59e73a7669a8ed0019079d44)
    -   Video
        -   [HTML5 Video Test samples](https://gist.github.com/DaveDaCoda/05082e804411d9c6f8aa)
        -   [Video 100% width and height](https://stackoverflow.com/questions/20127763/video-100-width-and-height)
        -   [Autoplay policy in Chrome](https://developer.chrome.com/blog/autoplay/)
        -   [How to disable Picture in Picture mode on HTML5 video](https://stackoverflow.com/questions/54458516/how-to-disable-picture-in-picture-mode-on-html5-video)
-   [Icons Tutorial](https://www.w3schools.com/icons/default.asp)
-   [Clear Text Selection with JavaScript](https://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript)

#### Server

-   Server-side Packages
    -   Socket.IO
        -   [Client Initialization](https://socket.io/docs/v4/client-initialization/)
        -   [Handling CORS](https://socket.io/docs/v3/handling-cors/)
            -   [cors options](https://github.com/expressjs/cors#configuration-options)
        -   [Parameters on Connection](https://stackoverflow.com/questions/25083564/socket-io-parameters-on-connection)
    -   [Mongoose](https://mongoosejs.com/docs/guide.html)
        -   [MongoDB 연동 #1](https://javafa.gitbooks.io/nodejs_server_basic/content/chapter12.html)
        -   [MongoDB 연동 #2](https://devlog-h.tistory.com/27)
        -   [Schema, array, default value](https://github.com/Automattic/mongoose/issues/250)
-   [우분투 리눅스 타임존 설정](https://www.lesstif.com/lpt/ubuntu-linux-timezone-setting-61899162.html)

#### Web2Stream

-   [Live Streaming with headless Chrome](https://docs.google.com/presentation/d/1b-HvxKmeFYE3qoNDJDHfbgVwEbi0QgmTvpH8w4CK5Tw/edit#slide=id.gc6f90357f_0_0)
    -   [Example video](https://www.youtube.com/watch?v=V4TVfMjMy_k)
    -   [Bitbucket repository](https://bitbucket.org/goempirical/bullman/src/master/)
    -   Fixing `get_input_index.sh` file
        -   [자식 프로세스에서 데이터 출력이 불규칙하게 들어올 때 한 줄씩 나누기](https://bakyeono.net/post/2015-09-25-nodejs-child-process-stdout-split-lines.html)
        -   [How to get spawned child to communicate with parent](https://stackoverflow.com/questions/21343347/nodejs-how-to-get-spawned-child-to-communicate-with-parent)
        -   [Remove empty lines in a text file via grep](https://stackoverflow.com/questions/1611809/remove-empty-lines-in-a-text-file-via-grep)
    -   [Stream to twitch via ffmpeg](https://discuss.dev.twitch.tv/t/stream-to-twitch-via-ffmpeg/27879)
        -   [Recommended Ingest Endpoints For You](https://stream.twitch.tv/ingests/)
        -   [How to set loglevel](https://stackoverflow.com/questions/35169650/differentiate-between-error-and-standard-terminal-log-with-ffmpeg-nodejs)
        -   [Using 1080p](https://video.stackexchange.com/questions/14907/how-to-downsample-4k-to-1080p-using-ffmpeg-while-maintaining-the-quality)
-   Stream recorded by MediaRecorder
    -   [browserLiveStream/server.js](https://github.com/apivideo/browserLiveStream/blob/master/server.js)
    -   [browserLiveStream/public/index.html](https://github.com/apivideo/browserLiveStream/blob/master/public/index.html)
    -   [MediaDevices.getDisplayMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
    -   [MediaStreamTrack.stop()](https://developer.mozilla.org/ko/docs/Web/API/MediaStreamTrack/stop)
    -   [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)
        -   Events
            -   [loadeddata](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadeddata_event)
    -   [Mainpulating video using canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas)
-   MediaStream sync with WebRTC
    -   [WebRTC 구현하기(1:N SFU)](https://millo-l.github.io/WebRTC-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0-1-N-SFU/)
    -   [wrtc](https://www.npmjs.com/package/wrtc)
    -   [WebRTC Samples](https://webrtc.github.io/samples/)
-   [Puppeteer-Screen-Recorder](https://github.com/prasanaworld/puppeteer-screen-recorder)
    -   [stream.PassThrough](https://nodejs.org/api/stream.html#stream_class_stream_passthrough)
    -   Chromium
        -   [Play mp4 in chromium with puppeteer, windows](https://stackoverflow.com/questions/47976790/play-mp4-in-chromium-with-puppeteer-windows)
        -   [How to enable chrome features from the command line](https://stackoverflow.com/questions/59724378/how-to-enable-chrome-features-from-the-command-line)
            -   [content_features.cc](https://chromium.googlesource.com/chromium/src/+/c07a3fb4b16e27c3afed46ddd0a38dab34feb699/content/public/common/content_features.cc)
            -   [media_switches.cc](https://chromium.googlesource.com/chromium/src/media/+/master/base/media_switches.cc)
        -   [한글 깨짐 처리](https://lahuman.github.io/dockerfile_alpine_puppeteer/)
        -   [How to get all console messages with puppeteer](https://stackoverflow.com/questions/47539043/how-to-get-all-console-messages-with-puppeteer-including-errors-csp-violations)
-   HLS
    -   [Server node.js for livestreaming](https://stackoverflow.com/questions/48401234/server-node-js-for-livestreaming)
    -   [FFmpeg](https://www.bogotobogo.com/VideoStreaming/ffmpeg_http_live_streaming_hls.php)
        -   [limit number of segment file](https://stackoverflow.com/questions/45894687/ffmpeg-limit-number-of-segment-file)
        -   [Tuning example #1](https://superuser.com/questions/1647179/hls-stream-created-from-webcam-with-ffmpeg-is-not-displayed-correctly)
        -   [Tuning example #2](https://pastebin.com/GnSgaq1w)
        -   [keyint, min-keyint, no-scenecut](https://video.stackexchange.com/questions/24680/what-is-keyint-and-min-keyint-and-no-scenecut)
            -   [Setting a fixed GOP length using keyint](https://superuser.com/questions/886855/issues-splitting-a-video-into-multiple-less-than-10-second-parts-when-using-ffm)
-   [FFmpeg](https://www.ffmpeg.org/documentation.html)
    -   [Fixed framerate sync](https://video.stackexchange.com/questions/13066/how-to-encode-a-video-at-30-fps-from-images-taken-at-7-fps)
    -   [Applying multiple filters and inputs at once](https://superuser.com/questions/1239546/applying-multiple-filters-and-inputs-with-ffmpeg)
    -   [Repeat last frame in video](https://stackoverflow.com/questions/43414641/repeat-last-frame-in-video-using-ffmpeg)

#### Integration with Twitch

-   [Twitch Dev Docs](https://dev.twitch.tv/docs/)
-   [Fetch](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Using_Fetch)
    -   [node-fetch](https://velog.io/@ahn0min/Node.js-fetch-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0)
    -   [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects)
    -   [예제](https://blog.joyfui.com/1206)
-   Communicate with other pages
    -   [document.cookie](https://ko.javascript.info/cookie)
    -   [url에서 파라미터 추출하기](https://goodteacher.tistory.com/354)
    -   [How to redirect to another webpage](https://www.w3schools.com/howto/howto_js_redirect_webpage.asp)

#### Deployment with Docker

-   [도커 입문하기 4 - 도커 이미지 만들기](https://code-masterjung.tistory.com/133)
-   [도커 입문하기 5 - 이미지 업데이트](https://code-masterjung.tistory.com/134)
-   [도커 컨테이너(Docker container) 빌드하기](https://devlos.tistory.com/28)
-   [로컬 Docker 이미지 파일 저장 후 원격 서버에 배포하기](https://hwanlee.tistory.com/18)
    -   [도커(Docker) 사용 중인 컨테이너 이미지 백업 및 복원하기](https://m.blog.naver.com/chandong83/221006388637)
-   [ffmpeg install within existing Node.js docker image](https://stackoverflow.com/questions/50693091/ffmpeg-install-within-existing-node-js-docker-image)

## 목표 및 현황

| 목표                                     | 현황                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 방송 플랫폼에 실시간 방송 송출           | 1계정 스트리밍 시 정상 가동<br>2계정 이상 사용 시 degradation 발생                                                |
| 웹캠과 화면 등 공유                      | 웹캠 오버레이 및 화면 공유 오버레이 제작 완료                                                                     |
| 각종 오버레이 표시                       | [목록](overlay_and_transition_list.md) 내의 오버레이들 제작 완료<br>웹 브라우저 오버레이 사용 시 degradation 발생 |
| 장면 구성                                | 완료                                                                                                              |
| 장면 전환                                | 완료                                                                                                              |
| 장면 전환 효과 선택 및 구성              | [목록](overlay_and_transition_list.md) 내의 장면 전환 효과들 제작 완료<br>스팅어 장면 전환 없음                   |
| 트위치로 로그인                          | 완료<br>2개 이상 계정에서 로그인하여 동시에 방송 진행 가능 (degradation 발생)                                     |
| 트위치 방송 제목 및 카테고리 변경        | 완료                                                                                                              |
| 각 장면 별 default 제목 및 카테고리 설정 | 완료                                                                                                              |
| 방송 스트림 주소 자동 획득               | 완료                                                                                                              |
| 반응형 웹 디자인 적용                    | 모바일에서도 대부분의 기능 구현<br>iOS 및 macOS의 경우 사용자 경험 충돌 발생                                      |
| 방송 설정 등 서버에 보관                 | 완료                                                                                                              |
| 모든 인터넷 방송인이 이용 가능           | 현재 트위치 스트리머에 최적화되어 있음                                                                            |

## 한계

1. 2개 이상의 계정에서 동시에 방송을 진행하거나 웹 브라우저 오버레이를 사용하는 등
   Web2Stream 작업을 여러 개 진행하는 경우에는 방송 끊김(buffering)이 발생하는 등 degradation이 발생
    - 원인: 서버 제원의 한계
        - Web2Stream 시스템의 구조상 FFmpeg에서 영상 및 음성을 합성하고 변환하는 과정에서 많은 부하가 발생
        - 현재 hardware acceleration을 사용할 수 없어 software rendering을 해야 함
            - 현재 Docker에서는 [NVIDIA 사의 GPU만을 지원](https://docs.docker.com/config/containers/resource_constraints/#gpu)하며, 이 외의 GPU는 Docker container 내에서 이용 불가
            - 현재 서버에서는 CPU에 내장된 Intel GPU만을 이용 가능
    - 해결방안
        - Web2Stream을 대체할 다른 수단 탐색
        - 더 가벼운 동작이 가능하도록 FFmpeg의 파라미터 튜닝
        - 혹은 NVIDIA GPU를 구입하여 서버에 장착
        - 동영상 처리까지 가능한 cloud server 탐색
2. macOS나 iOS의 경우에서 사용자 경험 충돌: 내장 동영상 플레이어로 인한 사용자 경험 문제
    - 증상
        - 웹캠 화면이 최대화되었을 때에만 스트림이 공유
        - 동영상 화면이 최대화되었을 때에만 동영상이 재생
    - 원인: macOS 및 iOS에서 브라우저에 가하는 제약이 더욱 강함
    - 해결방안: 다른 Javascript 기반 동영상 플레이어를 이용
3. 1차적으로 트위치만을 지원 대상으로 한정: 궁극적으로는 다른 방송 플랫폼까지 아우를 수 있어야
    - 특히, 최근 트위치에서 서비스를 축소시키고 있음
        - [최대 송출 해상도를 720p로 제한](https://blog.twitch.tv/ko-kr/2022/09/28/한국-twitch-업데이트/)
        - [한국 IP 사용자의 다시보기 및 클립 접근을 차단](https://blog.twitch.tv/ko-kr/2022/11/09/vod-콘텐츠에-관한-twitch-코리아-업데이트-및-약관-변경의-건/)
    - 유튜브 등 다른 방송 플랫폼을 지원하는 것이 필요

## 하고 싶은 말

본 프로젝트는 이 웹 어플리케이션이, 방송을 하고자 하는 사람이라면 누구든지 인터넷 방송을 할 수 있도록 그 재정적 및 기술적 문턱을 낮추는 시발점이 될 것으로 기대합니다.
특히, 방송 플랫폼이나 후원 플랫폼과의 협업으로 이들 플랫폼을 직접 연동하여 더욱 다양한 서비스를 제공하는 것도 가능할 것으로 기대합니다.
