# 워홀의 실크스크린 공정 조사 노트

필터 알고리즘(`public/filter.js`)의 근거. 2026-11-04 조사, 같은 날 원문 교차검증.
교차검증: 조사에 참여하지 않은 별도 에이전트가 원문(Tate 보존 보고서 PDF, 워홀 미술관 교안 원문)을 직접 읽고 주장마다 판정했다. MoMA 페이지는 접속이 막혀(403) 검색 요약과 위키백과로만 확인했다.

## 확인된 사실

| 항목 | 내용 | 검증 | 출처 · 주의 |
|---|---|---|---|
| 레이어 순서 | 색면을 먼저 칠하고, 마른 뒤 검정 사진 스크린을 맨 위에 찍는 것이 워홀의 표준 방식 | 지지됨(단서 있음) | 워홀 미술관(1970년대 주문 초상화, 1964 「꽃」), Tate TAAMPP(1973). **1962년 마릴린 일부는 먼저 찍고 → 손으로 칠하고 → 다시 찍었다**(Tate). "검정이 마지막"은 맞지만 "항상 색이 먼저"는 과장 |
| 색면 모양 | 필름 양화에서 단순한 윤곽을 따서, 주요 요소마다 다른 색 한 가지로 칠했다. 윤곽 안은 꼼꼼히, 나머지는 느슨하게 | 부분 지지 | 요소 목록(배경·피부·입술·홍채·눈두덩·눈썹)과 칠 방식은 **1973년 「브룩 헤이워드」** 기록. "머리"는 출처 없음. "명암을 따르지 않았다"는 평평한 색면에서 나온 추론 |
| 원본 사진 | 사진을 자르고 대비를 높여 상업 스크린 업체에 맡겼다. 결과물에 망점이 보인다 | 부분 지지 | 업체·대비 강화는 1964 「꽃」 교안, 자르기는 Tate(마릴린), 망점은 1973 작품. **"중간 톤이 사라짐"은 '고대비'에서 나온 추론**이며 직접 서술은 없다 |
| 판 어긋남 | 같은 스크린을 여러 칸에 다시 써서 검정 이미지가 색면과 정확히 맞지 않았다 | 지지됨(1973 한정) | Tate TAAMPP: 네 점에 같은 스크린을 썼고 "때때로" 어긋났다. 1962년 작품은 위키백과(2차)만 언급 |
| 잉크 얼룩 | 잉크가 많으면 망점이 메워지고, 적으면 유령처럼 흐려지고, 아래 3분의 1에 줄무늬 | 지지됨(1973 한정) | Tate TAAMPP. **모두 1973년 초상화의 관찰**이라 마릴린의 특징으로 말하면 안 된다 |
| 「마릴린 두폭화」 | 얼굴 50개. 왼쪽은 색, 오른쪽은 흑백으로 점점 흐려진다 | 부분 지지 | 위키백과, Tate 설명(검색 요약). 원래 두 작품이었다(흑백 먼저, 컬러 나중, Tate). **5×5 배열은 원문에서 확인 못 함** |
| 배경색 | 마릴린 연작 배경: 민트(청록), 체리(빨강), 초록, 레몬, 파랑, 주황, 라벤더, 포도, 감초(검정) | 지지됨 | 위키백과 「Flavor Marilyns」, 갤러리 자료. **"금색은 골드 마릴린뿐"과 요소별 색(노랑 머리, 빨강 입술 등)은 출처 없음** |
| 1967 판화집 | 한 이미지로 10장, 장마다 다른 색 조합. 데이비드 휘트니가 색 조합 상당수를 골라 워홀의 승인을 받았다. 판마다 스크린 약 5개 | 부분 지지 | 위키백과(MoMA 403). "손 밑칠 없음"은 확인 못 함 |
| 실측값 | 톤 단계 수, 망점 선수(lpi), 어긋남 거리의 실측값 | 없음 확인 | 확인한 모든 출처에 수치가 없다. 필터의 숫자는 설계 선택 |

**핵심 주의**: 판 어긋남, 잉크 얼룩, 칠 방식의 가장 구체적인 증거는 1973년 초상화 한 점에서 나왔다. 발표에서는 "워홀의 실크스크린 작업에서 관찰된 특징"으로 말하고, 1962년 마릴린의 특징이라고 단정하지 않는다.

## 필터에 옮긴 규칙과 근거

| 필터 동작 | 근거 수준 |
|---|---|
| 배경 한 색 + 인물 한 색을 평평하게 칠함, 윤곽은 흐리게 따서 삐져나오게 | 원칙은 근거 있음. 인물을 한 색으로 합친 것(입술·눈 등 분리 안 함)은 단순화 |
| 검정 판을 맨 위에 찍음 | 근거 있음 |
| 어두운 30% 꽉 찬 검정, 다음 30% 망점, 밝은 40% 잉크 없음 | 고대비·망점은 근거 있음. 비율은 설계 선택 |
| 45° 원형 망점, 칸 5px | 설계 선택(실측값 없음) |
| 검정 판 1~4% 어긋남 + 최대 1° 회전, 색면 ±1.5% | 어긋남 자체는 근거 있음(1973). 수치는 설계 선택 |
| 잉크 양 0.7~1.35배, 아래 3분의 1 줄무늬 강조 | 1973 관찰을 옮김. 수치는 설계 선택 |
| 2×2 반복, 칸마다 다른 배경·인물 색 | 1967 판화집의 '같은 판, 다른 색 조합'. 배경색은 Flavor Marilyns 계열 |
| 사진 배경에는 검정을 찍지 않음 | 설계 선택(원본 홍보 사진의 단순한 배경을 흉내) |

## 출처

- [Tate, In the conservation studio: Andy Warhol](https://www.tate.org.uk/visit/tate-modern/display/in-the-studio/in-the-conservation-studio-andy-warhol)
- [Tate, TAAMPP newsletter 3 (2008)](https://www.tate.org.uk/documents/99/taampp_newsletter_3_january2008.pdf)
- [Warhol Museum, Underpainting and Photographic Silkscreen Printing](https://www.warhol.org/wp-content/uploads/2018/04/Silkscreen-4-Underpainting-and-Photographic-Silkscreen-Printing.docx)
- [Warhol Museum, Commissioned Portraits](https://warhol.org/lessons/commissioned-portraits)
- [MoMA, Gold Marilyn Monroe](https://www.moma.org/collection/works/79737) · [MoMA, Marilyn Monroe portfolio](https://www.moma.org/collection/works/61240) (403, 검색 요약으로 확인)
- [Wikipedia, Marilyn Diptych](https://en.wikipedia.org/wiki/Marilyn_Diptych) · [Marilyn Monroe portfolio](https://en.wikipedia.org/wiki/Marilyn_Monroe_portfolio) · [Flavor Marilyns](https://en.wikipedia.org/wiki/Flavor_Marilyns)
