// 地図を id="map" の箱の中に作る。setView([緯度, 経度], ズーム)で初期位置
const map = L.map('map').setView([41.84, 140.76], 16); // 例: 函館付近

// 航空写真タイル（衛星画像）を貼る。農地は航空写真の方が見やすい
L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Esri', maxZoom: 19 }
).addTo(map);

// 描いた図形を保管する層
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// 描画コントロール（左上に出るツールバー）
const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,    // 多角形だけ使う
    polyline: false,
    rectangle: true,  // 長方形も便利なので許可
    circle: false,
    marker: false,
    circlemarker: false,
  },
  edit: { featureGroup: drawnItems }  // 描いた後で修正できるように
});
map.addControl(drawControl);

let routeLayer = null;

function drawRouteOnMap(waypoints) {
  if (routeLayer) map.removeLayer(routeLayer); // 前回の線を消す

  // waypoints は [経度,緯度] の内部形式。Leafletは[緯度,経度]なので戻す
  const latlngs = waypoints.map(w => [w.lat, w.lon]);
  routeLayer = L.polyline(latlngs, { color: 'red' }).addTo(map);

  // 各ウェイポイントに番号付きの点も打つ
  waypoints.forEach((w, i) => {
    L.circleMarker([w.lat, w.lon], { radius: 4 })
      .bindTooltip(String(i)).addTo(routeLayer);
  });
}
let _drawnPolygonCoords = null;
// 描き終わったときのイベント
map.on('draw:created', (e) => {
  drawnItems.clearLayers();           // 前の図形を消す
  drawnItems.addLayer(e.layer);       // 新しい図形を追加

  // [経度, 緯度] の配列として取り出す（Turf.js 形式）
  _drawnPolygonCoords = e.layer.getLatLngs()[0]
    .map(ll => [ll.lng, ll.lat]);
});

// main.js から呼ばれる関数
function getDrawPolygon() {
  if (!_drawnPolygonCoords) {
    alert('先に圃場を描いてください');
    return null;
  }
  return _drawnPolygonCoords;
}
