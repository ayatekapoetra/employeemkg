import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Add, Filter, Refresh } from "iconsax-react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import "moment/locale/id";
import { AppScreen, HeaderScreen } from "../../../src/components/common";
import {
  getDailyActivityAccess,
  getDailyActivityList,
  setDailyActivityFilters,
} from "../../../src/store/slices/dailyActivitySlice";
import FilterBottomSheet from "./components/FilterBottomSheet";
import {
  emptyFilters,
  groupActivityRows,
  shiftLabel,
  statusMeta,
  themeColors,
} from "./utils";

export default function DailyActivityListScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.themes)?.value || "light";
  const auth = useSelector((state) => state.auth);
  const state = useSelector((root) => root.dailyActivity);
  const theme = themeColors(mode);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const employee = auth?.karyawan || auth?.user?.karyawan || {};
  const params = useMemo(
    () => ({
      ...state.filters,
      area: employee?.area || employee?.cabang?.area || undefined,
      page: 1,
      limit: 50,
    }),
    [state.filters, employee?.area, employee?.cabang?.area],
  );
  const load = useCallback(async () => {
    const access = await dispatch(getDailyActivityAccess()).unwrap();
    if (access?.can_read !== false)
      await dispatch(getDailyActivityList(params)).unwrap();
  }, [dispatch, params]);
  useEffect(() => {
    load().catch(() => {});
  }, [load]);
  const rows = useMemo(() => groupActivityRows(state.list), [state.list]);
  const sites = useMemo(
    () => [
      ...new Map(
        rows
          .filter((x) => x.lokasi_site_id)
          .map((x) => [
            String(x.lokasi_site_id),
            {
              id: String(x.lokasi_site_id),
              nama: x.lokasi_site_nama || String(x.lokasi_site_id),
            },
          ]),
      ).values(),
    ],
    [rows],
  );
  const pits = useMemo(
    () => [
      ...new Map(
        rows
          .filter((x) => x.lokasi_pit_id)
          .map((x) => [
            String(x.lokasi_pit_id),
            {
              id: String(x.lokasi_pit_id),
              nama: x.lokasi_pit_nama || String(x.lokasi_pit_id),
            },
          ]),
      ).values(),
    ],
    [rows],
  );
  const contractors = useMemo(
    () =>
      [...new Set(rows.map((x) => x.kontraktor).filter(Boolean))].map((x) => ({
        id: x,
        nama: x,
      })),
    [rows],
  );
  const filterCount = Object.values(state.filters || emptyFilters).filter(
    Boolean,
  ).length;
  const refresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch {
    } finally {
      setRefreshing(false);
    }
  };
  const canRead = state.permissions?.can_read === true;
  const renderItem = ({ item }) => {
    const meta = statusMeta(item.status);
    const duration =
      item.start_time_min && item.finish_time_max
        ? moment(item.finish_time_max).diff(
            moment(item.start_time_min),
            "minutes",
          )
        : 0;
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/operational/daily-activity/[id]",
            params: { id: String(item.first_header_id), status: item.status },
          })
        }
        style={{
          marginBottom: 12,
          padding: 14,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.card,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontFamily: "Poppins-Bold",
                fontSize: 14,
              }}
            >
              {moment(item.date_ops).format("ddd, DD MMM YYYY")}
            </Text>
            <Text
              style={{
                color: theme.muted,
                fontFamily: "Quicksand-Medium",
                marginTop: 2,
              }}
            >
              {item.lokasi_site_nama || "-"} · {item.lokasi_pit_nama || "-"}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: meta.color,
              borderRadius: 99,
              paddingHorizontal: 10,
              justifyContent: "center",
              alignItems: "center",
              height: 28,
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontFamily: "Quicksand-Bold",
                fontSize: 11,
              }}
            >
              {meta.label}
            </Text>
          </View>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: theme.border,
            marginVertical: 12,
          }}
        />
        <Text style={{ color: theme.text, fontFamily: "Quicksand-Bold" }}>
          {(item.kegiatan_names || []).join(", ") || "-"}
        </Text>
        <Text
          style={{
            color: theme.muted,
            fontFamily: "Quicksand-Medium",
            fontSize: 12,
            marginTop: 3,
          }}
        >
          {item.kontraktor || "-"} · {item.cuaca || "-"} · Shift{" "}
          {shiftLabel(item.shift_id)}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <Text
            style={{
              color: meta.color,
              fontFamily: "Quicksand-Bold",
              fontSize: 12,
            }}
          >
            {item.equipment_ids?.length ||
              item.item_count ||
              item.items?.length ||
              0}{" "}
            Unit
          </Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>·</Text>
          <Text
            style={{
              color: theme.muted,
              fontFamily: "Quicksand-SemiBold",
              fontSize: 12,
            }}
          >
            {item.start_time_min
              ? moment(item.start_time_min).format("HH:mm")
              : "-"}{" "}
            -{" "}
            {item.finish_time_max
              ? moment(item.finish_time_max).format("HH:mm")
              : "-"}{" "}
            ({Math.max(0, duration / 60).toFixed(duration % 60 ? 1 : 0)} jam)
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <AppScreen>
      <HeaderScreen
        title="Daily Activity Equipment"
        onBack={() => router.back()}
        onThemes
        onNotification
      />
      <FlatList
        data={canRead ? rows : []}
        keyExtractor={(item) => item.group_key}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 14 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.text,
                    fontFamily: "Poppins-Bold",
                    fontSize: 18,
                  }}
                >
                  Riwayat Status Unit
                </Text>
                <Text
                  style={{
                    color: theme.muted,
                    fontFamily: "Quicksand-Medium",
                    fontSize: 12,
                  }}
                >
                  Data online berdasarkan status activity
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFilterOpen(true)}
                style={{
                  flexDirection: "row",
                  gap: 6,
                  padding: 11,
                  borderRadius: 12,
                  backgroundColor: theme.primary,
                }}
              >
                <Filter size={17} color="#FFF" />
                <Text style={{ color: "#FFF", fontFamily: "Quicksand-Bold" }}>
                  Filter{filterCount ? ` (${filterCount})` : ""}
                </Text>
              </TouchableOpacity>
            </View>
            {(state.loading || state.permissionsLoading) && (
              <ActivityIndicator
                color={theme.primary}
                style={{ marginTop: 18 }}
              />
            )}
            {!!(state.error || state.permissionsError) && (
              <TouchableOpacity
                onPress={refresh}
                style={{
                  flexDirection: "row",
                  gap: 6,
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: mode === "dark" ? "#7F1D1D" : "#FEE2E2",
                }}
              >
                <Refresh size={17} color={theme.danger} />
                <Text
                  style={{
                    color: theme.danger,
                    flex: 1,
                    fontFamily: "Quicksand-Bold",
                  }}
                >
                  {state.error || state.permissionsError}
                </Text>
              </TouchableOpacity>
            )}
            {!state.permissionsLoading &&
              !canRead &&
              !state.permissionsError && (
                <Text
                  style={{
                    color: theme.danger,
                    marginTop: 14,
                    fontFamily: "Quicksand-Bold",
                  }}
                >
                  Anda tidak memiliki akses membaca Daily Activity.
                </Text>
              )}
          </View>
        }
        ListEmptyComponent={
          !state.loading && canRead ? (
            <Text
              style={{
                textAlign: "center",
                color: theme.muted,
                marginTop: 40,
                fontFamily: "Quicksand-Medium",
              }}
            >
              Belum ada Daily Activity untuk filter ini.
            </Text>
          ) : null
        }
      />
      <FilterBottomSheet
        visible={filterOpen}
        value={state.filters}
        sites={sites}
        pits={pits}
        contractors={contractors}
        onClose={() => setFilterOpen(false)}
        onApply={(filters) => dispatch(setDailyActivityFilters(filters))}
      />
      {state.permissions?.can_insert === true && (
        <TouchableOpacity
          onPress={() => router.push("/operational/daily-activity/create")}
          style={{
            position: "absolute",
            right: 20,
            bottom: 26,
            width: 58,
            height: 58,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            backgroundColor: "#10B981",
            elevation: 6,
          }}
        >
          <Add size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </AppScreen>
  );
}
