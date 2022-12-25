# 오버레이 및 장면 전환 종류 및 종류별 파라미터

## 오버레이

<table>
    <tr>
        <th rowspan=2>종류</th>
        <th colspan=2></th>
        <th rowspan=2>설명</th>
    </tr>
    <tr>
        <th>파라미터</th>
        <th>형식</th>
    </tr>
    <tr>
        <td rowspan=12>(공통)</td>
        <td colspan=2></td>
        <td>-</td>
    </tr>
    <tr>
        <td>background_color</td>
        <td>#RRGGBB</td>
        <td>배경색</td>
    </tr>
    <tr>
        <td>background_opacity</td>
        <td>float</td>
        <td>배경색 투명도 (0.0 ~ 1.0)</td>
    </tr>
    <tr>
        <td>opacity</td>
        <td>float</td>
        <td>전체 투명도 (0.0 ~ 1.0)</td>
    </tr>
    <tr>
        <td>aspect_ratio</td>
        <td>boolean</td>
        <td>크기 조절 시 비율 유지 여부</td>
    </tr>
    <tr>
        <td>radius</td>
        <td>px</td>
        <td>꼭짓점을 둥글게 할 때 적용할 반경</td>
    </tr>
    <tr>
        <td>border_color</td>
        <td>#RRGGBB</td>
        <td>테두리 색상</td>
    </tr>
    <tr>
        <td>border_opacity</td>
        <td>float</td>
        <td>테두리 투명도 (0.0 ~ 1.0)</td>
    </tr>
    <tr>
        <td>border_width</td>
        <td>px</td>
        <td>테두리 두께</td>
    </tr>
    <tr>
        <td>border_style</td>
        <td>enum</td>
        <td>테두리 종류 (CSS border-style과 같음)<br>(none, dotted, dashed, solid, double, groove, ridge, inset, outset)</td>
    </tr>
    <tr>
        <td>margin</td>
        <td>px</td>
        <td>테두리 바깥 여백 두께</td>
    </tr>
    <tr>
        <td>padding</td>
        <td>px</td>
        <td>테두리 안쪽 여백 두께</td>
    </tr>
    <tr>
        <td rowspan=10>텍스트</td>
        <td colspan=2></td>
        <td>텍스트를 표시</td>
    </tr>
    <tr>
        <td>overflow</td>
        <td>enum</td>
        <td>텍스트가 공간을 초과할 경우 처리<br>(숨김, 표시)</td>
    </tr>
    <tr>
        <td>text</td>
        <td>string</td>
        <td>표시할 텍스트</td>
    </tr>
    <tr>
        <td>font_size</td>
        <td>pt</td>
        <td>글꼴 크기</td>
    </tr>
    <tr>
        <td>font_flags</td>
        <td>dict</td>
        <td>글꼴 속성 (bold, italic, underline, strike)</td>
    </tr>
    <tr>
        <td>font_color</td>
        <td>#RRGGBB</td>
        <td>글꼴 색상</td>
    </tr>
    <tr>
        <td>font_opacity</td>
        <td>float</td>
        <td>글자 투명도 (0.0 ~ 1.0)</td>
    </tr>
    <tr>
        <td>text_align_horizontal</td>
        <td>enum</td>
        <td>가로 정렬 (왼쪽, 가운데, 오른쪽, 양쪽)</td>
    </tr>
    <tr>
        <td>text_align_vertical</td>
        <td>enum</td>
        <td>세로 정렬 (위, 중간, 아래)</td>
    </tr>
    <tr>
        <td>text_line_height</td>
        <td>float</td>
        <td>텍스트를 포함한 줄 높이 (텍스트의 n배)</td>
    </tr>
    <tr>
        <td rowspan=3>도형</td>
        <td colspan=2></td>
        <td>도형을 표시</td>
    </tr>
    <tr>
        <td>shape_type</td>
        <td>enum</td>
        <td>표시할 도형의 종류(사각형, 타원형, 삼각형)</td>
    </tr>
    <tr>
        <td>triangle_position</td>
        <td>%</td>
        <td>삼각형 표시 시 꼭짓점의 위치</td>
    </tr>
    <tr>
        <td rowspan=3>이미지<br>비디오</td>
        <td colspan=2></td>
        <td>이미지/비디오를 표시 및 재생</td>
    </tr>
    <tr>
        <td>src_type</td>
        <td>enum</td>
        <td>사용할 경로 종류 (URL, 업로드)</td>
    </tr>
    <tr>
        <td>src</td>
        <td>string</td>
        <td>표시할 이미지/비디오의 경로</td>
    </tr>
    <tr>
        <td>웹캠<br>화면 공유</td>
        <td colspan=2></td>
        <td>웹캠/화면 공유를 표시 및 재생</td>
    </tr>
    <tr>
        <td rowspan=2>웹 브라우저</td>
        <td colspan=2></td>
        <td>웹 페이지 화면을 표시<br>(채팅방 등 표시에 사용)</td>
    </tr>
    <tr>
        <td>src</td>
        <td>string</td>
        <td>표시할 웹 페이지 주소</td>
    </tr>
</table>

## 장면 전환

<table>
    <tr>
        <th rowspan=2>종류</th>
        <th colspan=2></th>
        <th rowspan=2>설명</th>
    </tr>
    <tr>
        <th>파라미터</th>
        <th>형식</th>
    </tr>
    <tr>
        <td>기본 전환</td>
        <td colspan=2></td>
        <td>별도 효과 없이 즉각적으로 장면 전환</td>
    <tr>
        <td rowspan=2>밝기변화</td>
        <td colspan=2></td>
        <td>서서히 흐려지며 장면 전환 (fade)</td>
    </tr>
    <tr>
        <td>duration</td>
        <td>ms</td>
        <td>소요시간</td>
    <tr>
        <td rowspan=3>밀어내기</td>
        <td colspan=2></td>
        <td>장면을 밀어내며 전환 (slide)</td>
    </tr>
    <tr>
        <td>duration</td>
        <td>ms</td>
        <td>소요시간</td>
    </tr>
    <tr>
        <td>slide_from</td>
        <td>enum</td>
        <td>밀어내는 방향 (위, 아래, 왼쪽, 오른쪽)</td>
    </tr>
</table>
