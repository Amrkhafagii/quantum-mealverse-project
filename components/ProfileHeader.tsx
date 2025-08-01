import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Pencil, Share } from 'lucide-react-native';

interface ProfileHeaderProps {
  userName: string;
  userHandle: string;
  userBio: string;
  profileImageUrl: string;
  onSettingsPress: () => void;
  onEditProfilePress: () => void;
  onShareProfilePress: () => void;
}

export default function ProfileHeader({
  userName,
  userHandle,
  userBio,
  profileImageUrl,
  onSettingsPress,
  onEditProfilePress,
  onShareProfilePress,
}: ProfileHeaderProps) {
  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
          <Settings size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editImageButton} onPress={onEditProfilePress}>
            <Pencil size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userHandle}>{userHandle}</Text>
        <Text style={styles.userBio}>{userBio}</Text>
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.editProfileButton} onPress={onEditProfilePress}>
            <Pencil size={16} color="#FF6B35" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareProfileButton} onPress={onShareProfilePress}>
            <Share size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF6B35',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 8,
  },
  userName: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  userBio: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
    marginRight: 12,
  },
  editProfileText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  shareProfileButton: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
});