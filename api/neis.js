export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.NEIS_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'NEIS API 키가 설정되지 않았습니다.' });
  }

  const { region } = req.query;

  try {
    // 특성화고(직업계 고등학교) 전체 조회
    // HS_GNRL_BUSNS_SC_NM=직업 → 직업계 고등학교만 필터
    const params = new URLSearchParams({
      KEY: API_KEY,
      Type: 'json',
      pIndex: '1',
      pSize: '1000',
      SCHUL_KND_SC_NM: '고등학교',
      HS_GNRL_BUSNS_SC_NM: '직업',
    });

    if (region && region !== '전체') {
      params.set('LCTN_SC_NM', region);
    }

    const url = `https://open.neis.go.kr/hub/schoolInfo?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    // NEIS API 오류 처리
    if (data.RESULT) {
      // 데이터 없음 (정상적인 빈 결과)
      if (data.RESULT.CODE === 'INFO-200') {
        return res.status(200).json({ schools: [] });
      }
      return res.status(400).json({ error: data.RESULT.MESSAGE || 'NEIS API 오류' });
    }

    const rows = data.schoolInfo?.[1]?.row || [];

    // 필요한 필드만 추출하여 반환
    const schools = rows.map(s => ({
      name: s.SCHUL_NM,
      region: s.LCTN_SC_NM,
      dept: s.HS_SC_NM || '특성화고',
      url: s.HMPG_ADRES || '',
      address: s.ORG_RDNMA || '',
      phone: s.ORG_TELNO || '',
      type: s.HS_GNRL_BUSNS_SC_NM || '',
    }));

    return res.status(200).json({ schools });
  } catch (e) {
    return res.status(500).json({ error: 'NEIS API 호출 실패', detail: e.message });
  }
}
