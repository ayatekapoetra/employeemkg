import { DocumentText } from 'iconsax-react-native';
import { Button, HStack, Pressable, Spinner, Text, VStack } from 'native-base';
import { useState } from 'react';
import { Image, View } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { PHOTO_BASE_URL } from '../../../services/api/endpoints';
import { getAttachmentUrl, isImageAttachment } from './utils';

function ImageAttachment({ url, label, theme, onPreview, onOpenFile }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  return (
    <Pressable onPress={failed ? onOpenFile : onPreview} accessibilityLabel={`Lihat gambar ${label}`} _pressed={{ opacity: 0.8 }}>
      <VStack borderWidth={1} borderColor={theme.border} rounded="xl" overflow="hidden">
        <View style={{ width: '100%', aspectRatio: 1.6, backgroundColor: theme.input, alignItems: 'center', justifyContent: 'center' }}>
          {failed ? (
            <VStack alignItems="center" p={4} space={2}>
              <DocumentText size={32} color={theme.muted} />
              <Text color={theme.muted} fontSize="xs" textAlign="center">Gambar gagal dimuat. Ketuk untuk membuka file.</Text>
            </VStack>
          ) : (
            <Image
              source={{ uri: url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              accessibilityLabel={label}
              onLoadEnd={() => setLoading(false)}
              onError={() => { setFailed(true); setLoading(false); }}
            />
          )}
          {loading && <View pointerEvents="none" style={{ position: 'absolute' }}><Spinner color={theme.accent} /></View>}
        </View>
        <VStack p={3} space={1}>
          <Text color={theme.text} fontSize="sm" fontFamily="Quicksand-SemiBold" numberOfLines={2}>{label}</Text>
          <Text color={theme.accent} fontSize="xs">Ketuk untuk memperbesar gambar</Text>
        </VStack>
      </VStack>
    </Pressable>
  );
}

export default function PurchaseOrderAttachments({ files = [], theme, onOpenFile }) {
  const [previewIndex, setPreviewIndex] = useState(null);
  const attachments = files.filter(file => file.aktif !== 'N').map(file => ({
    file,
    url: getAttachmentUrl(file, PHOTO_BASE_URL),
    label: file.name || (file.url || file.full_url || '').split(/[?#]/)[0].split('/').pop() || `Lampiran #${file.id}`,
  }));
  const images = attachments.filter(({ file, url }) => url && isImageAttachment(file)).map(({ url, label }) => ({ uri: url, label }));

  return (
    <VStack bg={theme.card} p={4} rounded="xl" borderWidth={1} borderColor={theme.border} space={3}>
      <Text fontSize="md" fontFamily="Quicksand-Bold" color={theme.text}>Lampiran ({attachments.length})</Text>
      {attachments.map(({ file, url, label }) => url && isImageAttachment(file) ? (
        <ImageAttachment
          key={`${file.id}:${url}`}
          url={url}
          label={label}
          theme={theme}
          onPreview={() => setPreviewIndex(images.findIndex(image => image.uri === url))}
          onOpenFile={() => onOpenFile(file)}
        />
      ) : (
        <Button key={file.id} variant="outline" onPress={() => onOpenFile(file)} isDisabled={!url} leftIcon={<DocumentText size={20} color={theme.accent} />}>
          {label}
        </Button>
      ))}
      {attachments.length === 0 && <Text color={theme.muted} fontSize="sm">Belum ada lampiran.</Text>}
      <ImageViewing
        images={images}
        imageIndex={Math.max(0, Math.min(previewIndex ?? 0, images.length - 1))}
        visible={previewIndex !== null && images.length > 0}
        onRequestClose={() => setPreviewIndex(null)}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        presentationStyle="overFullScreen"
        HeaderComponent={({ imageIndex }) => (
          <HStack safeAreaTop p={4} space={3} alignItems="center" justifyContent="space-between" bg="rgba(0,0,0,0.5)">
            <VStack flex={1}>
              <Text color="white" fontFamily="Quicksand-Bold" numberOfLines={2}>{images[imageIndex]?.label}</Text>
              <Text color="white" fontSize="xs">{imageIndex + 1} / {images.length}</Text>
            </VStack>
            <Button variant="ghost" onPress={() => setPreviewIndex(null)} _text={{ color: 'white' }}>Tutup</Button>
          </HStack>
        )}
      />
    </VStack>
  );
}
