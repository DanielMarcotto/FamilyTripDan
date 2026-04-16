import React, { useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View, Share } from 'react-native'

import Page from '@/components/templates/Page'
import Header from '@/components/templates/Header'
import { ScrollView } from 'react-native-gesture-handler'
import { Ionicons } from "@expo/vector-icons"

interface VersionInfo {
  version: string
  buildNumber: string
  releaseDate: string
  changes: string[]
  type: "major" | "minor" | "patch" | "hotfix"
}

interface SystemInfo {
  label: string
  value: string
  icon: string
}

const currentVersion: VersionInfo = {
  version: "1.0.0",
  buildNumber: "2025.11.21.1",
  releaseDate: "Nov 21, 2025",
  type: "major",
  changes: [
    "Auth",
    "Navigation Tab (Liquid Glass iOS)",
      "Introduzione POI",
      "Introduzione Destinazioni",
      "Introduzione Attività",
      "Mappe"
  ],
}

const versionHistory: VersionInfo[] = [
  {
      version: "1.0.0",
      buildNumber: "2025.11.21.1",
      releaseDate: "Nov 21, 2025",
      type: "major",
      changes: [
          "Auth",
          "Navigation Tab (Liquid Glass iOS)",
          "Introduzione POI",
          "Introduzione Destinazioni",
          "Introduzione Attività",
          "Mappe"
      ],
  },
]

const systemInfo: SystemInfo[] = [
  { label: "App Size", value: "75.2 MB", icon: "archive" },
  { label: "Minimum iOS", value: "iOS 14.0+", icon: "phone-portrait" },
  { label: "Minimum Android", value: "Android 8.0+", icon: "logo-android" },
  { label: "Last Updated", value: "28 May 2025", icon: "time" },
]

const acknowledgments = [
  { name: "React Native", description: "Mobile app framework", url: "https://reactnative.dev" },
  { name: "Expo", description: "Development platform", url: "https://expo.dev" },
]



const Index = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([]))
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }
  const checkForUpdates = () => {
    setIsCheckingUpdate(true)
    // Simulate update check
    setTimeout(() => {
      setIsCheckingUpdate(false)
      // Show "You're up to date" message
    }, 2000)
  }
  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case "major":
        return "#FF7A00"
      case "minor":
        return "#2196F3"
      case "patch":
        return "#FF9800"
      case "hotfix":
        return "#F44336"
      default:
        return "#666"
    }
  }
  const getVersionTypeLabel = (type: string) => {
    switch (type) {
      case "major":
        return "Major Release"
      case "minor":
        return "Minor Update"
      case "patch":
        return "Bug Fix"
      case "hotfix":
        return "Hotfix"
      default:
        return "Update"
    }
  }

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: 'https://www.appstore.com/familytrip', // <-- your link here
      })

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType)
        } else {
          console.log('Link shared')
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed')
      }
    } catch (error: any) {
      console.error('Error sharing:', error.message)
    }
  }
  /*     const checkForUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync()
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync()
          Alert.alert('Update available', 'App will reload to apply the update.')
          Updates.reloadAsync()
        } else {
          Alert.alert('Up to date', 'You already have the latest version.')
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to check for updates.')
        console.log(e)
      }
    } */


  return (
    <Page noPaddingTop alignItems='center' justifyContent='space-between' >
      <Header buttonBack text=' ' />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Info Header */}
        <View style={styles.appInfoSection}>
          <View style={styles.appIcon}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={{ height: 50, width: 50 }}
            />
          </View>
          <Text style={styles.appName}>FamilyTrip</Text>
          <Text style={styles.appTagline}>Gite in famglia </Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>v{currentVersion.version}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.updateButton} onPress={checkForUpdates} disabled={isCheckingUpdate}>
            <Ionicons
              name={isCheckingUpdate ? "sync" : "cloud-download"}
              size={16}
              color="#FF7A00"
              style={isCheckingUpdate ? styles.spinning : undefined}
            />
            <Text style={styles.updateButtonText}>{isCheckingUpdate ? "Checking..." : "Check for Updates"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share" size={16} color="white" />
            <Text style={styles.shareButtonText}>Share App</Text>
          </TouchableOpacity>
        </View>

        {/* Current Version */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("current")}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Current Version</Text>
              <View style={[styles.versionTypeTag, { backgroundColor: getVersionTypeColor(currentVersion.type) }]}>
                <Text style={styles.versionTypeText}>{getVersionTypeLabel(currentVersion.type)}</Text>
              </View>
            </View>
            <Ionicons name={expandedSections.has("current") ? "chevron-up" : "chevron-down"} size={20} color="#666" />
          </TouchableOpacity>

          {expandedSections.has("current") && (
            <View style={styles.sectionContent}>
              <View style={styles.versionDetails}>
                <View style={styles.versionRow}>
                  <Text style={styles.versionLabel}>Version:</Text>
                  <Text style={styles.versionValue}>{currentVersion.version}</Text>
                </View>
                <View style={styles.versionRow}>
                  <Text style={styles.versionLabel}>Build:</Text>
                  <Text style={styles.versionValue}>{currentVersion.buildNumber}</Text>
                </View>
                <View style={styles.versionRow}>
                  <Text style={styles.versionLabel}>Released:</Text>
                  <Text style={styles.versionValue}>{currentVersion.releaseDate}</Text>
                </View>
              </View>

              <Text style={styles.changesTitle}>What's New:</Text>
              {currentVersion.changes.map((change, index) => (
                <View key={index} style={styles.changeItem}>
                  <Text style={styles.changeBullet}>•</Text>
                  <Text style={styles.changeText}>{change}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* System Information */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("system")}>
            <Text style={styles.sectionTitle}>System Information</Text>
            <Ionicons name={expandedSections.has("system") ? "chevron-up" : "chevron-down"} size={20} color="#666" />
          </TouchableOpacity>

          {expandedSections.has("system") && (
            <View style={styles.sectionContent}>
              {systemInfo.map((info, index) => (
                <View key={index} style={styles.systemInfoRow}>
                  <View style={styles.systemInfoLeft}>
                    <Ionicons name={info.icon as any} size={20} color="#FF7A00" />
                    <Text style={styles.systemInfoLabel}>{info.label} </Text>
                  </View>
                  <Text style={styles.systemInfoValue}>{info.value} </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Version History */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("history")}>
            <Text style={styles.sectionTitle}>Version History</Text>
            <Ionicons name={expandedSections.has("history") ? "chevron-up" : "chevron-down"} size={20} color="#666" />
          </TouchableOpacity>

          {expandedSections.has("history") && (
            <View style={styles.sectionContent}>
              {versionHistory.map((version, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyTitleRow}>
                      <Text style={styles.historyVersion}>v{version.version}</Text>
                      <View style={[styles.versionTypeTag, { backgroundColor: getVersionTypeColor(version.type) }]}>
                        <Text style={styles.versionTypeText}>{getVersionTypeLabel(version.type)}</Text>
                      </View>
                    </View>
                    <Text style={styles.historyDate}>{version.releaseDate}</Text>
                  </View>
                  {version.changes.map((change, changeIndex) => (
                    <View key={changeIndex} style={styles.changeItem}>
                      <Text style={styles.changeBullet}>•</Text>
                      <Text style={styles.changeText}>{change}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Acknowledgments */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection("acknowledgments")}>
            <Text style={styles.sectionTitle}>Acknowledgments</Text>
            <Ionicons
              name={expandedSections.has("acknowledgments") ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {expandedSections.has("acknowledgments") && (
            <View style={styles.sectionContent}>
              <Text style={styles.acknowledgementsIntro}>
                FamilyTrip is built with amazing open-source technologies and services:
              </Text>
              {acknowledgments.map((ack, index) => (
                <TouchableOpacity key={index} style={styles.acknowledgmentItem}>
                  <View style={styles.acknowledgmentInfo}>
                    <Text style={styles.acknowledgmentName}>{ack.name}</Text>
                    <Text style={styles.acknowledgmentDescription}>{ack.description}</Text>
                  </View>
                  <Ionicons name="open" size={16} color="#FF7A00" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Developer Info */}
        <View style={styles.footer}>
          <Text style={styles.copyrightText}>© 2025 FamilyTrip. All rights reserved.</Text>
          <TouchableOpacity style={styles.feedbackButton}>
            <Ionicons name="chatbubble" size={16} color="#FF7A00" />
            <Text style={styles.feedbackButtonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </Page>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    width: '100%'
  },
  appInfoSection: {
    padding: 24,
    backgroundColor: "#fff",
    marginTop: 140,
    marginBottom: 16,
    alignItems: "center",
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderColor: "#00000020",
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: 16,
  },
  appIconText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  versionBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  updateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF7A00",
    gap: 8,
  },
  updateButtonText: {
    fontSize: 14,
    color: "#FF7A00",
    fontWeight: "500",
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7A00",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  spinning: {
    // Add rotation animation if needed
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  versionTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  versionTypeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f4",
  },
  versionDetails: {
    marginBottom: 16,
  },
  versionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  versionLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  versionValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  changesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  changeItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 8,
  },
  changeBullet: {
    fontSize: 14,
    color: "#FF7A00",
    marginRight: 8,
    fontWeight: "bold",
  },
  changeText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 18,
    flex: 1,
  },
  systemInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  systemInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  systemInfoLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  systemInfoValue: {
    fontSize: 14,
    color: "#666",
  },
  historyItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  historyHeader: {
    marginBottom: 12,
  },
  historyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  historyVersion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  historyDate: {
    fontSize: 12,
    color: "#666",
  },
  acknowledgementsIntro: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  acknowledgmentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  acknowledgmentInfo: {
    flex: 1,
  },
  acknowledgmentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  acknowledgmentDescription: {
    fontSize: 12,
    color: "#666",
  },
  footer: {
    padding: 24,
    backgroundColor: "#fff",
    marginTop: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  copyrightText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 16,
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 14,
    color: "#FF7A00",
    fontWeight: "500",
  },
})




export default Index

