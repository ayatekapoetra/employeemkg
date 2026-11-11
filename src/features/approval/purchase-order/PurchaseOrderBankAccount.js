import { Button, FormControl, HStack, Input, Pressable, Spinner, Text, VStack } from 'native-base';
import { BottomSheetSelect } from '../components/FilterPurchaseRequestModal';
import { InfoRow } from './components';
import { getRelationName } from './utils';

export default function PurchaseOrderBankAccount({ order, accounts, draft, onChange, editable, disabled, loading, error, validationError, onRetry, theme }) {
  const selected = accounts.find(account => String(account.id) === String(draft.rekening_id));
  const change = (field, value) => onChange({ ...draft, [field]: value });

  return (
    <VStack bg={theme.card} p={4} rounded="xl" borderWidth={1} borderColor={theme.border} space={3}>
      <Text fontSize="md" fontFamily="Quicksand-Bold" color={theme.text}>Pemasok & Rekening</Text>
      <InfoRow theme={theme} label="Pemasok" value={getRelationName(order.pemasok)} />
      {editable ? (
        <>
          <HStack space={2}>
            {[['existing', 'Rekening Terdaftar'], ['new', 'Rekening Baru']].map(([mode, label]) => (
              <Pressable
                key={mode} flex={1} p={3} rounded="lg" borderWidth={1}
                borderColor={draft.mode === mode ? theme.accent : theme.border}
                bg={draft.mode === mode ? theme.summary : theme.input}
                onPress={() => change('mode', mode)} isDisabled={disabled}
                accessibilityRole="button" accessibilityState={{ selected: draft.mode === mode, disabled }}
              >
                <Text textAlign="center" color={theme.text} fontFamily="Quicksand-SemiBold" fontSize="xs">{label}</Text>
              </Pressable>
            ))}
          </HStack>
          {draft.mode === 'existing' ? (
            <VStack space={2}>
              <Text color={theme.muted} fontSize="xs">Pilih rekening milik pemasok PO ini</Text>
              {loading ? <HStack space={2}><Spinner size="sm" /><Text color={theme.muted} fontSize="xs">Memuat rekening pemasok...</Text></HStack> : null}
              {error ? (
                <VStack space={2}>
                  <Text color={theme.muted} fontSize="xs">{error}</Text>
                  <Button size="sm" variant="outline" onPress={onRetry} isDisabled={disabled}>Muat Ulang Rekening</Button>
                </VStack>
              ) : (
                <BottomSheetSelect
                  label="Rekening pemasok"
                  value={draft.rekening_id}
                  onSelect={value => change('rekening_id', value)}
                  placeholder="Pilih rekening pemasok"
                  disabled={disabled || loading}
                  mode={theme.mode}
                  options={[
                    { label: 'Tanpa rekening', value: '' },
                    ...accounts.map(account => ({
                      value: String(account.id),
                      label: [account.nm_bank, account.no_rekening].filter(Boolean).join(' • '),
                      subtitle: account.an ? `A/N ${account.an}` : '',
                    })),
                  ]}
                />
              )}
              {!loading && !error && accounts.length === 0 && <Text color={theme.muted} fontSize="xs">Belum ada rekening terdaftar. Pilih Rekening Baru untuk menambahkan.</Text>}
              {selected && <>
                <InfoRow theme={theme} label="Bank" value={selected.nm_bank || '-'} />
                <InfoRow theme={theme} label="No. Rekening" value={selected.no_rekening || '-'} />
                <InfoRow theme={theme} label="Atas Nama" value={selected.an || '-'} />
              </>}
            </VStack>
          ) : (
            <VStack space={3}>
              {[['nm_bank', 'Nama Bank', 'Contoh: BCA / Mandiri / BRI'], ['no_rekening', 'Nomor Rekening', 'Masukkan nomor rekening'], ['an', 'Atas Nama (A/N)', 'Nama pemilik rekening']].map(([field, label, placeholder]) => (
                <FormControl key={field} isRequired={field !== 'an'} isInvalid={Boolean(validationError) && field !== 'an' && !draft[field].trim()}>
                  <FormControl.Label _text={{ color: theme.muted, fontSize: 'xs' }}>{label}</FormControl.Label>
                  <Input
                    value={draft[field]} onChangeText={value => change(field, value)}
                    placeholder={placeholder} accessibilityLabel={label}
                    isDisabled={disabled} color={theme.text} bg={theme.input} borderColor={theme.border}
                    keyboardType={field === 'no_rekening' ? 'number-pad' : 'default'}
                    autoCapitalize={field === 'no_rekening' ? 'none' : 'words'}
                  />
                </FormControl>
              ))}
            </VStack>
          )}
          {validationError ? <Text color="red.500" fontSize="xs">{validationError}</Text> : null}
          <Text color={theme.muted} fontFamily="Poppins-Regular" fontSize="xs">Rekening yang dipilih atau ditambahkan akan disimpan saat Verifikasi & Finalisasi PO, sesuai pemasok dokumen ini.</Text>
        </>
      ) : (
        <>
          <InfoRow theme={theme} label="Bank" value={order.rekpemasok?.nm_bank || '-'} />
          <InfoRow theme={theme} label="No. Rekening" value={order.rekpemasok?.no_rekening || '-'} />
          <InfoRow theme={theme} label="Atas Nama" value={order.rekpemasok?.an || '-'} />
        </>
      )}
    </VStack>
  );
}
