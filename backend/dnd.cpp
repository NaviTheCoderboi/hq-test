#include "dnd.h"

#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <print>
#include <string>

#ifdef _WIN32
#include <windows.h>
#endif

namespace dnd {

static bool runCommand(const std::string& cmd) {
    int ret{std::system(cmd.c_str())};
    return (ret == 0);
}

bool enableDoNotDisturb() {
#ifdef _WIN32
    const char* psCmd{
        "powershell -Command \""
        "New-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\FocusAssist' "
        "-Name 'FocusAssist' -Value 2 -PropertyType DWord -Force\""};
    std::print("Enabling DND on windows\n");
    return runCommand(psCmd);

#elif __APPLE__
    const char* cmd{
        "defaults -currentHost write ~/Library/Preferences/ByHost/com.apple.notificationcenterui "
        "doNotDisturb -boolean true && killall NotificationCenter"};
    std::print("Enabling DND on macOS\n");
    return runCommand(cmd);

#elif __linux__
    const char* xdgCurrent{std::getenv("XDG_CURRENT_DESKTOP")};
    const std::string desktop{xdgCurrent ? xdgCurrent : ""};

    if (std::filesystem::exists("/usr/bin/swaync-client")) {
        std::print("Enabling DND on Sway\n");
        if (runCommand("swaync-client -dn"))
            return true;
    }

    if (std::filesystem::exists("/usr/bin/makoctl")) {
        std::print("Enabling DND on Mako\n");
        if (runCommand("makoctl mode -a do-not-disturb"))
            return true;
    }

    if (std::filesystem::exists("/usr/bin/dunstctl")) {
        std::print("Enabling DND on Dunst\n");
        if (runCommand("dunstctl set-paused true"))
            return true;
    }

    if (std::filesystem::exists("/usr/bin/hyprctl")) {
        std::print("Enabling DND on Hyprland\n");
        if (runCommand("hyprctl dispatch notify 2 'Do Not Disturb Enabled'"))
            return true;
    }

    if (desktop.find("GNOME") != std::string::npos) {
        std::print("Enabling DND on GNOME\n");
        if (runCommand("gsettings set org.gnome.desktop.notifications show-banners false"))
            return true;
    }

    if (desktop.find("KDE") != std::string::npos) {
        std::print("Enabling DND on KDE\n");
        if (runCommand("qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript "
                       "'dndManager.enabled=true'"))
            return true;
    }

    std::cerr << "[WARN] Could not detect a known DE to enable DND.\n";
    return false;

#else
    std::cerr << "Unsupported platform.\n";
    return false;
#endif
}

bool disableDoNotDisturb() {
#ifdef _WIN32
    const char* psCmd{
        "powershell -Command \""
        "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\FocusAssist' "
        "-Name 'FocusAssist' -Value 0\""};
    std::print("Disabling DND on windows\n");
    return runCommand(psCmd);

#elif __APPLE__
    const char* cmd{
        "defaults -currentHost write ~/Library/Preferences/ByHost/com.apple.notificationcenterui "
        "doNotDisturb -boolean false && killall NotificationCenter"};
    std::print("Disabling DND on macOS\n");
    return runCommand(cmd);

#elif __linux__
    const char* xdgCurrent{std::getenv("XDG_CURRENT_DESKTOP")};
    const std::string desktop{xdgCurrent ? xdgCurrent : ""};

    if (std::filesystem::exists("/usr/bin/swaync-client")) {
        std::print("Disabling DND on Sway\n");
        if (runCommand("swaync-client -df"))
            return true;
    }

    if (std::filesystem::exists("/usr/bin/makoctl")) {
        std::print("Disabling DND on Mako\n");
        if (runCommand("makoctl mode -r do-not-disturb"))
            return true;
    }

    if (std::filesystem::exists("/usr/bin/dunstctl")) {
        std::print("Disabling DND on Dunst\n");
        if (runCommand("dunstctl set-paused false"))
            return true;
    }

    if (std::filesystem::exists("/usr/bin/hyprctl")) {
        std::print("Disabling DND on Hyprland\n");
        if (runCommand("hyprctl dispatch notify 2 'Do Not Disturb Disabled'"))
            return true;
    }

    if (desktop.find("GNOME") != std::string::npos ||
        std::filesystem::exists("/usr/bin/gsettings")) {

        std::print("Disabling DND on GNOME\n");
        if (runCommand("gsettings set org.gnome.desktop.notifications show-banners true"))
            return true;
    }

    if (desktop.find("KDE") != std::string::npos || std::filesystem::exists("/usr/bin/qdbus")) {
        std::print("Disabling DND on KDE\n");
        if (runCommand("qdbus org.kde.plasmashell /PlasmaShell org.kde.PlasmaShell.evaluateScript "
                       "'dndManager.enabled=false'"))
            return true;
    }

    std::cerr << "[WARN] Could not detect a known DE to disable DND.\n";
    return false;

#else
    std::cerr << "Unsupported platform.\n";
    return false;
#endif
}

} // namespace dnd
