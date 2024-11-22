import { VStack, Text, useClipboard } from 'native-base';
import React, { useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';

const TeksLink = ({ 
    teks,
    fontFamily,
    fontSize,
    lineHeight,
    color,

 }) => {
    const [clipboardContent, setClipboardContent] = useState('');
    const { onCopy } = useClipboard();

    const copyToClipboard = (string) => {
        Clipboard.setString(string);
        alert('Teks berhasil disalin ke clipboard');
    };

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = teks.split(urlRegex);
    return (
        <Text>
        {parts.map((part, index) => {
            if (part.match(urlRegex)) {
            return (
                <Text
                    onPress={() => copyToClipboard(part)}
                    key={index}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    color={color}
                    style={{ color: 'red' }}>
                    { part }
                </Text>
            );
            } else {
            return (
                <Text 
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    color={color}
                    key={index}>
                    { part }
                </Text>
            )
            }
        })}
        </Text>
    );
};

export default TeksLink