import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import appcolor from '../../../common/colorMode';

// Warna yang berbeda untuk setiap cabang
const colors = {
  dark: [
    'rgba(255, 99, 132, 0.5)', 
    'rgba(54, 162, 235, 0.5)', 
    'rgba(255, 206, 86, 0.5)', 
    'rgba(75, 192, 192, 0.5)', 
    'rgba(153, 102, 255, 0.5)',
  ],
  light: [
    'rgba(255, 99, 132, 0.2)', 
    'rgba(54, 162, 235, 0.2)', 
    'rgba(255, 206, 86, 0.2)', 
    'rgba(75, 192, 192, 0.2)', 
    'rgba(153, 102, 255, 0.2)',
  ]
}

// Pengaturan chart
const numberOfVariables = 4; // "jemput", "dikirim", "transit", "tiba"
const radius = 100; // Radius polar chart
const centerX = 150; // Koordinat X pusat chart
const centerY = 150; // Koordinat Y pusat chart
const labels = [
  'Jemput', 
  'Dikirim', 
  'Transit', 
  'Tiba'
]; // Label untuk sumbu

const RenderItemChart = ( { mode, dataCabang } ) => {
  // State untuk mengontrol visibilitas dari setiap cabang
  const [visible, setVisible] = useState([true, true, true, true, true]);

  // Fungsi untuk toggle visibilitas cabang
  const toggleVisibility = (index) => {
    const updatedVisible = [...visible];
    updatedVisible[index] = !updatedVisible[index];
    setVisible(updatedVisible);
  };

  // Fungsi untuk membuat titik-titik polygon dari data
  const getPointsForPolygon = (data) => {
    const angleStep = (Math.PI * 2) / numberOfVariables;

    return data.map((value, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * (value / 100) * Math.cos(angle);
      const y = centerY + radius * (value / 100) * Math.sin(angle);
      return `${x},${y}`;
    });
  };

  // Fungsi untuk mendapatkan posisi label di sekitar chart
  const getLabelPosition = (index) => {
    const angleStep = (Math.PI * 2) / numberOfVariables;
    const angle = index * angleStep - Math.PI / 2;
    const x = centerX + (radius + 20) * Math.cos(angle);
    const y = centerY + (radius + 20) * Math.sin(angle);
    return { x, y };
  };

  return (
    <View>
      <Svg height="300" width="300">
        <G>
          {/* Membuat sumbu-sumbu */}
          {Array.from({ length: numberOfVariables }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / numberOfVariables - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <Line
                key={`axis-${i}`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="gray"
                strokeWidth="1"
              />
            );
          })}

          {/* Membuat lingkaran konsentris untuk referensi skala */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Circle
              key={`circle-${i}`}
              cx={centerX}
              cy={centerY}
              r={(radius * (i + 1)) / 5}
              stroke="lightgray"
              strokeWidth="1"
              fill="none"
            />
          ))}

          {/* Menambahkan label untuk tiap kategori */}
          {labels.map((label, i) => {
            const { x, y } = getLabelPosition(i);
            return (
              <SvgText
                key={`label-${i}`}
                x={x}
                y={y}
                fill={mode == 'dark' ? "#ddd":"#605B5C"}
                fontSize="12"
                textAnchor="middle"
              >
                {label}
              </SvgText>
            );
          })}

          {/* Membuat polygon untuk setiap cabang hanya dengan garis berwarna */}
          {dataCabang.map((cabang, i) => {
            if (!visible[i]) return null; // Sembunyikan poligon jika cabang tidak visible
            const points = getPointsForPolygon([
              cabang.jemput,
              cabang.dikirim,
              cabang.transit,
              cabang.tiba,
            ]);
            return (
              <Polygon
                key={`polygon-${i}`}
                points={points.join(' ')}
                stroke={colors[mode][i]}
                strokeWidth="5"
                fill={colors[mode][i]} // Area polygon tidak diwarnai, hanya garis
              />
            );
          })}
        </G>
      </Svg>

      {/* Legend */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, justifyContent: 'center' }}>
        {dataCabang.map((cabang, i) => (
          <TouchableOpacity key={`legend-${i}`} onPress={() => toggleVisibility(i)} style={{ margin: 5, flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 20,
                height: 10,
                backgroundColor: visible[i] ? colors[mode][i] : 'lightgray',
                marginRight: 5,
              }}
            />
            <Text style={{color: appcolor.teks[mode][1]}}>{cabang.cabang}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default RenderItemChart;