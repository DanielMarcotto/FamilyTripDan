import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from "@expo/vector-icons"

import Page from '@/components/templates/Page'
import { ScrollView } from 'react-native-gesture-handler'
import Header from '@/components/templates/Header'

interface Section {
  id: string
  title: string
  content: string[]
  expanded?: boolean
}

const termsData: Section[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: [
      "By downloading, installing, or using the FamilyTrip mobile application ('App'), you agree to be bound by these Terms and Conditions ('Terms').",
      "If you do not agree to these Terms, please do not use the App.",
      "We reserve the right to modify these Terms at any time. Continued use of the App constitutes acceptance of any changes.",
    ],
  },

]


const Index = () => {

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const renderSection = (section: Section) => {
    const isExpanded = expandedSections.has(section.id)

    return (
      <View key={section.id} style={styles.sectionCard}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section.id)}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            {section.content.map((paragraph, index) => (
              <Text key={index} style={styles.paragraphText}>
                {paragraph}
              </Text>
            ))}
          </View>
        )}
      </View>
    )
  }


  return (
    <Page noPaddingTop alignItems='center' justifyContent='space-between' >
      <Header buttonBack text=' ' />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.privacyIcon}>
            <Ionicons name="document" size={32} color="#FF7A00" />
          </View>
          <Text style={styles.introTitle}>Terms & Conditions </Text>
          <Text style={styles.introSubtitle}>Last updated: September 2025 </Text>
          <Text style={styles.introText}>
            Please read these Terms and Conditions carefully before using the FamilyTrip application. These terms govern your
            use of our service and outline your rights and responsibilities as a user.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              const allSectionIds = new Set(termsData.map((section) => section.id))
              setExpandedSections(allSectionIds)
            }}
          >
            <Ionicons name="expand" size={16} color="#FF7A00" />
            <Text style={styles.actionButtonText}>Expand All</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setExpandedSections(new Set())}>
            <Ionicons name="contract" size={16} color="#FF7A00" />
            <Text style={styles.actionButtonText}>Collapse All</Text>
          </TouchableOpacity>
        </View>

        {/* Terms Sections */}
        <View style={styles.sectionsContainer}>{termsData.map(renderSection)}</View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing to use FamilyTrip, you acknowledge that you have read, understood, and agree to be bound by these
            Terms and Conditions.
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail" size={16} color="#FF7A00" />
            <Text style={styles.contactButtonText}>Contact Legal Team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </Page>
  )
}

const styles = StyleSheet.create({
  container: {
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
  },
  introSection: {
    padding: 24,
    backgroundColor: "#fff",
    marginBottom: 16,
    alignItems: "center",
    marginTop: 100
  },
  privacyIcon: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  introSubtitle: {
    fontSize: 14,
    color: "#FF7A00",
    fontWeight: "600",
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    textAlign: "center",
    marginTop: 50
  },
  highlightsSection: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  highlightsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  highlightText: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF7A00",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#FF7A00",
    fontWeight: "500",
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f4",
  },
  paragraphText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  subsection: {
    marginTop: 16,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 8,
  },
  bulletText: {
    fontSize: 14,
    color: "#FF7A00",
    marginRight: 8,
    fontWeight: "bold",
  },
  bulletContent: {
    fontSize: 14,
    color: "#555",
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    padding: 24,
    backgroundColor: "#fff",
    marginTop: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000010",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  contactButtonText: {
    fontSize: 14,
    color: "#FF7A00",
    fontWeight: "500",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7A00",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  settingsButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
})



export default Index

