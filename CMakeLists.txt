# Basic config
cmake_minimum_required(VERSION 4.0)

set(PROJECT_NAME "TheHQProject")
set(PROJECT_VERSION "1.0.0")
set(PROJECT_ICON "${CMAKE_SOURCE_DIR}/assets/logo.ico")
set(PROJECT_DESCRIPTION "a study time tracker application")
project(${PROJECT_NAME})

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(SRC_DIR backend)
set(INCLUDE_DIR "include")

add_executable(${PROJECT_NAME} ${SRC_DIR}/main.cpp)

file(GLOB_RECURSE SRC_FILES ${SRC_DIR}/*.cpp)
file(GLOB_RECURSE HEADER_FILES ${INCLUDE_DIR}/*.h ${INCLUDE_DIR}/*.hpp)

target_sources(${PROJECT_NAME} PRIVATE ${SRC_FILES} ${HEADER_FILES})
target_include_directories(${PROJECT_NAME} PRIVATE ${INCLUDE_DIR})

# Dependencies
include(cmake/CPM.cmake)

CPMAddPackage(
    NAME           saucer
    VERSION        7.0.0
    GIT_REPOSITORY "https://github.com/saucer/saucer"
)

target_link_libraries(${PROJECT_NAME} PRIVATE saucer::saucer)

saucer_embed("dist")

target_link_libraries(${PROJECT_NAME} PRIVATE saucer::saucer saucer::embedded)

set(SQLITE3_DIR "${CMAKE_SOURCE_DIR}/external/sqlite3")
set(SQLITE3_SOURCES
    ${SQLITE3_DIR}/sqlite3.c
)

add_library(sqlite3 STATIC ${SQLITE3_SOURCES})
target_include_directories(sqlite3 PUBLIC ${SQLITE3_DIR})
target_link_libraries(${PROJECT_NAME} PRIVATE sqlite3)

# Packaging
if (WIN32)
    set(APP_ICON_RESOURCE "${CMAKE_SOURCE_DIR}/appIcon.rc")
    target_sources(${PROJECT_NAME} PRIVATE ${APP_ICON_RESOURCE})
endif()

install(TARGETS ${PROJECT_NAME}
    RUNTIME DESTINATION "bin"
    COMPONENT application
)

install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/dist
    DESTINATION share/${PROJECT_NAME}
    COMPONENT resources
    OPTIONAL
)

if (EXISTS "${CMAKE_SOURCE_DIR}/LICENSE")
    install(FILES "${CMAKE_SOURCE_DIR}/LICENSE"
            DESTINATION share/licenses/${PROJECT_NAME})
endif()

set(CPACK_PACKAGE_NAME ${PROJECT_NAME})
set(CPACK_PACKAGE_VENDOR "NaviTheCoderboi")
set(CPACK_PACKAGE_CONTACT "https://github.com/NaviTheCoderboi")
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "${PROJECT_DESCRIPTION}")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_INSTALL_DIRECTORY ${PROJECT_NAME})
set(CPACK_PACKAGE_ICON ${PROJECT_ICON})
set(CPACK_RESOURCE_FILE_LICENSE "${CMAKE_SOURCE_DIR}/LICENSE")

if (WIN32)
    set(CPACK_GENERATOR "NSIS")

    set(CPACK_COMPONENTS_ALL application resources Unspecified)

    set(CPACK_NSIS_DISPLAY_NAME "${PROJECT_NAME}")
    set(CPACK_NSIS_PACKAGE_NAME "${PROJECT_NAME}")
    set(CPACK_NSIS_INSTALLED_ICON_NAME "bin\\\\${PROJECT_NAME}.exe")
    
    set(CPACK_NSIS_HELP_LINK "https://github.com/NaviTheCoderboi")
    set(CPACK_NSIS_URL_INFO_ABOUT "https://github.com/NaviTheCoderboi")
    set(CPACK_NSIS_CONTACT "${CPACK_PACKAGE_CONTACT}")
    
    set(CPACK_NSIS_MODIFY_PATH OFF)
    set(CPACK_NSIS_ENABLE_UNINSTALL_BEFORE_INSTALL ON)
    
    if(EXISTS "${PROJECT_ICON}")
        set(CPACK_NSIS_MUI_ICON "${PROJECT_ICON}")
        set(CPACK_NSIS_MUI_UNIICON "${PROJECT_ICON}")
    endif()
    
    set(CPACK_NSIS_CREATE_ICONS_EXTRA
        "CreateShortCut '$SMPROGRAMS\\\\$STARTMENU_FOLDER\\\\${PROJECT_NAME}.lnk' '$INSTDIR\\\\bin\\\\${PROJECT_NAME}.exe'
         CreateShortCut '$DESKTOP\\\\${PROJECT_NAME}.lnk' '$INSTDIR\\\\bin\\\\${PROJECT_NAME}.exe'")
    set(CPACK_NSIS_DELETE_ICONS_EXTRA
        "Delete '$SMPROGRAMS\\\\$STARTMENU_FOLDER\\\\${PROJECT_NAME}.lnk'
         Delete '$DESKTOP\\\\${PROJECT_NAME}.lnk'")
    
    set(CPACK_NSIS_EXTRA_PREINSTALL_COMMANDS "
        ClearErrors
        ReadRegStr $0 HKLM 'SOFTWARE\\\\WOW6432Node\\\\Microsoft\\\\EdgeUpdate\\\\Clients\\\\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}' 'pv'
        IfErrors webview2_missing webview2_ok
        webview2_missing:
            MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION 'Warning: Microsoft Edge WebView2 Runtime is not installed.$\\\\n$\\\\n${PROJECT_NAME} requires WebView2 to run properly.$\\\\n$\\\\nDownload from: https://go.microsoft.com/fwlink/p/?LinkId=2124703$\\\\n$\\\\nClick OK to continue installation anyway.' IDOK continue IDCANCEL abort
            abort:
                Abort 'Installation cancelled by user.'
            continue:
                DetailPrint 'WebView2 not found - user chose to continue'
                Goto done
        webview2_ok:
            DetailPrint 'WebView2 Runtime detected (version: $0)'
        done:
    ")
    
    set(CPACK_NSIS_EXTRA_INSTALL_COMMANDS "
        WriteINIStr '$INSTDIR\\\\Download_WebView2.url' 'InternetShortcut' 'URL' 'https://go.microsoft.com/fwlink/p/?LinkId=2124703'
        CreateShortCut '$SMPROGRAMS\\\\$STARTMENU_FOLDER\\\\Download WebView2 Runtime.lnk' '$INSTDIR\\\\Download_WebView2.url'
    ")
    
    set(CPACK_NSIS_EXTRA_UNINSTALL_COMMANDS "
        Delete '$SMPROGRAMS\\\\$STARTMENU_FOLDER\\\\Download WebView2 Runtime.lnk'
        Delete '$INSTDIR\\\\Download_WebView2.url'
    ")
    
    set(CPACK_NSIS_MUI_FINISHPAGE_RUN "$INSTDIR\\\\bin\\\\${PROJECT_NAME}.exe")
elseif(APPLE)
    set(CPACK_GENERATOR "DragNDrop")
    set(CPACK_DMG_VOLUME_NAME "${PROJECT_NAME}")

else()
    set(CPACK_GENERATOR "TGZ")
endif()

include(CPack)