# Basic config
cmake_minimum_required(VERSION 4.0 )

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
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "a study time tracker application")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_INSTALL_DIRECTORY ${PROJECT_NAME})
set(CPACK_PACKAGE_ICON ${PROJECT_ICON})
set(CPACK_RESOURCE_FILE_LICENSE "${CMAKE_SOURCE_DIR}/LICENSE")

if (WIN32)
    set(CPACK_GENERATOR "ZIP;WIX")

    set(CPACK_COMPONENTS_ALL application resources Unspecified)

    set(CPACK_WIX_UPGRADE_GUID "A1B2C3D4-E5F6-4789-A1B2-C3D4E5F67890")

    set(CPACK_WIX_PRODUCT_ICON "${PROJECT_ICON}")
    set(CPACK_WIX_PROPERTY_ARPHELPLINK "https://github.com/saucer/saucer")
    set(CPACK_WIX_PROPERTY_ARPURLINFOABOUT "https://github.com/saucer/saucer")
    set(CPACK_WIX_PROPERTY_ARPCONTACT "${CPACK_PACKAGE_CONTACT}")

    set(CPACK_WIX_LICENSE_RTF "${CMAKE_SOURCE_DIR}/assets/LICENSE.rtf")
    set(CPACK_WIX_PROGRAM_MENU_FOLDER "${PROJECT_NAME}")

    set(CPACK_WIX_TEMPLATE "${CMAKE_SOURCE_DIR}/cmake/WIX.template.in")
elseif(APPLE)
    set(CPACK_GENERATOR "DragNDrop")
    set(CPACK_DMG_VOLUME_NAME "${PROJECT_NAME}")

else()
    set(CPACK_GENERATOR "TGZ")
endif()

include(CPack)