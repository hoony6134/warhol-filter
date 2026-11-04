# 워홀의 실크스크린 공정 조사 노트

필터 알고리즘(`public/filter.js`)의 근거. 2026-11-04 조사. 미술관·보존 처리 자료를 우선했다.

## 확인된 사실

| 항목 | 내용 | 신뢰도 | 출처 |
|---|---|---|---|
| 레이어 순서 | 평평한 색면(배경, 얼굴, 입술, 눈두덩, 머리)을 **먼저** 아크릴로 칠하고, 마른 뒤 **검정 사진 스크린을 맨 위에** 찍었다 | 높음 | Tate 보존 처리 전시, MoMA, Warhol Museum 교안, Tate TAAMPP 보고서(2008) |
| 색면 모양 | 사진에서 단순한 윤곽만 따서 요소마다 한 가지 색으로 채웠다. 명암을 따라 칠하지 않았다. 이목구비는 윤곽 안에 꼼꼼히, 나머지는 느슨하게 칠했다 | 높음 | Tate TAAMPP, Warhol Museum |
| 원본 사진 | 마릴린 연작은 모두 영화 《나이아가라》(1953) 홍보 사진 한 장(진 콘먼 촬영)에서 출발했다. 사진을 자르고 대비를 높여 상업 스크린 업체에 맡겨 확대 필름 양화와 망점 스크린을 만들었다. 결과적으로 중간 톤이 사라지고 몇 단계만 남는다 | 중간 | MoMA, Warhol Museum 교안 |
| 판 어긋남 | 같은 스크린을 여러 칸에 다시 써서, 검정 이미지가 색면과 정확히 맞지 않았다 | 높음 | Tate TAAMPP, Smarthistory |
| 잉크 얼룩 | 잉크가 많으면 망점이 메워져 새까매지고, 적으면 이미지가 유령처럼 흐려진다. 화면 아래 3분의 1에 스퀴지 줄무늬가 남은 예가 있다 | 높음 | Tate TAAMPP |
| 반복 | 「마릴린 두폭화」는 5×5 두 판, 50번 반복. 왼쪽은 색, 오른쪽은 검정만, 오른쪽은 진하게 번진 얼굴부터 흐린 얼굴까지 농도가 달라진다 | 중간 | Wikipedia, Tate 설명 |
| 색 | 배경은 청록, 초록, 파랑, 레몬 노랑, 주황, 빨강. 금색 배경은 「골드 마릴린」뿐. 머리는 노랑, 입술은 빨강, 눈두덩은 초록·청록, 얼굴은 분홍 | 중간 | MoMA, Smarthistory |
| 1967 판화집 | 같은 판으로 10장, 장마다 다른 색 조합. 색 조합은 대부분 데이비드 휘트니가 골라 워홀의 승인을 받았다. 손으로 밑칠하지 않고 여러 색을 스크린으로 찍었다 | 중간 | MoMA, Wikipedia |

## 확인하지 못한 것

- 톤 단계 수, 망점 선수(lpi), 어긋남 거리의 **실측값**은 어떤 자료에도 없다. 필터의 숫자는 설계 선택이다.
- 가장 자세한 기술 자료는 1973년 주문 초상화 「브룩 헤이워드」 보존 처리 보고서다. 1962–64년 마릴린에 적용하는 것은 미술관 설명과 맞지만 추론이 섞여 있다.
- 제라드 말랑가 등 조수의 구체적 역할, 형광 분홍·은색 잉크 사용 여부는 확인하지 못했다.

## 필터에 옮긴 규칙

1. **색면 먼저**: 배경 한 색 + 인물 한 색. 인물 윤곽은 흐리게 한 뒤 낮은 기준으로 잘라 느슨하게 삐져나오게 한다. 명암에 따라 색을 바꾸지 않는다.
2. **검정 스크린 마지막**: 어두운 곳은 꽉 찬 검정, 중간 톤은 45° 망점(셀 5px), 밝은 곳은 잉크 없음.
3. **판 어긋남**: 칸마다 검정 판을 타일 폭의 1~4%만큼 밀고 최대 1° 돌린다. 색면도 따로 조금 민다.
4. **잉크 양**: 칸마다 0.7~1.35배. 많으면 망점이 메워지고 적으면 흐려진다. 아래 3분의 1에 스퀴지 줄무늬를 더 세게 넣는다.
5. **반복**: 2×2, 칸마다 다른 배경·인물 색(1967 판화집처럼). 사진마다 무작위 값이 달라 같은 사진도 찍을 때마다 다르게 나온다.

## 출처

- [Tate, In the conservation studio: Andy Warhol](https://www.tate.org.uk/visit/tate-modern/display/in-the-studio/in-the-conservation-studio-andy-warhol)
- [Tate, TAAMPP newsletter 3 (2008)](https://www.tate.org.uk/documents/99/taampp_newsletter_3_january2008.pdf)
- [MoMA, Gold Marilyn Monroe](https://www.moma.org/collection/works/79737) · [MoMA Learning](https://www.moma.org/learn/moma_learning/andy-warhol-gold-marilyn-monroe-1962/)
- [MoMA, Marilyn Monroe portfolio](https://www.moma.org/collection/works/61240)
- [Warhol Museum, Underpainting and Photographic Silkscreen Printing](https://www.warhol.org/wp-content/uploads/2018/04/Silkscreen-4-Underpainting-and-Photographic-Silkscreen-Printing.docx)
- [Warhol Museum, Commissioned Portraits](https://warhol.org/lessons/commissioned-portraits)
- [Smarthistory, Gold Marilyn Monroe](https://smarthistory.org/warhol-gold-marilyn-monroe)
- [Wikipedia, Marilyn Diptych](https://en.wikipedia.org/wiki/Marilyn_Diptych) · [Marilyn Monroe portfolio](https://en.wikipedia.org/wiki/Marilyn_Monroe_portfolio)
