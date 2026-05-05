import React, { useMemo, useEffect, useState, useCallback } from "react";
import Box from "../../components/Box";
import Input from "../../components/Input";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { backendAccessGet, backendAccessPost } from "../../../utils/Authentication";
import { mainCategoryConfig, normalizeNumericFieldsByConfig } from "../../../utils/categoryConfig";

const toNum = (v) => (v === null || v === undefined ? null : Number(v));
const toTextId = (v) => (v === null || v === undefined ? null : String(v));
const normalizeSubcategoryList = (items) => {
  if (!Array.isArray(items)) return [];

  const deduped = new Map();
  items.forEach((item) => {
    const subId = toNum(item?.subcategory_id);
    if (subId === null || Number.isNaN(subId)) return;
    deduped.set(subId, { ...item, subcategory_id: subId });
  });

  return Array.from(deduped.values());
};

const Category = () => {
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  const [categorycontent, setCategorycontent] = useState([]); // processed list

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  const [namecategory, setnamecategory] = useState("");
  const [namesubcategory, setnamesubcategory] = useState("");

  const [selectedMainCategory, setSelectedMainCategory] = useState(mainCategoryConfig[0]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [inputValues, setInputValues] = useState({});
  const [addCategoryContentValues, setAddCategoryContentValues] = useState({});
  const [addSubcategoryContentValues, setAddSubcategoryContentValues] = useState({});
  const [editCategoryContentValues, setEditCategoryContentValues] = useState({});
  const [editSubcategoryContentValues, setEditSubcategoryContentValues] = useState({});
  const [contentExists, setContentExists] = useState(false);
  const [contentId, setContentId] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);

  // edit / delete
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditSubcategoryModal, setShowEditSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);

  const getEmptyValues = useCallback(() => {
    const empty = {};
    (selectedMainCategory?.content || []).forEach((f) => (empty[f.key] = ""));
    return empty;
  }, [selectedMainCategory]);

  const mergeContentValues = useCallback(
    (values) =>
      normalizeNumericFieldsByConfig(
        {
          ...getEmptyValues(),
          ...(values || {}),
        },
        selectedMainCategory
      ),
    [getEmptyValues, selectedMainCategory]
  );

  const processCategoryContent = useCallback((data) => {
    // normalize keys + merge by (maincategory_id, category_id)
    const result = new Map();

    (data || []).forEach((item) => {
      const mId = toNum(item.maincategory_id);
      const cId = toNum(item.category_id);
      const key = `${mId}_${cId}`;

      if (!result.has(key)) {
        result.set(key, {
          id: item.id,
          maincategory_id: mId,
          category_id: cId,
          categorycontent: item.categorycontent || {},
          subcategorycontent: normalizeSubcategoryList(item.subcategorycontent),
        });
      } else {
        const prev = result.get(key);
        // keep categorycontent if exists
        prev.categorycontent = prev.categorycontent || item.categorycontent || {};
        // merge subcategorycontent
        if (Array.isArray(item.subcategorycontent) && item.subcategorycontent.length > 0) {
          prev.subcategorycontent = normalizeSubcategoryList([
            ...(prev.subcategorycontent || []),
            ...item.subcategorycontent,
          ]);
        }
        result.set(key, prev);
      }
    });

    return Array.from(result.values());
  }, []);

  const refetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesResponse, subcategoriesResponse, contentResponse] = await Promise.all([
        backendAccessGet("api/category/fetch/"),
        backendAccessGet("api/subcategory/fetch/"),
        backendAccessGet("api/categorycontent/fetch/"),
      ]);

      setCategory(categoriesResponse?.categories || []);
      setSubcategory(subcategoriesResponse?.subcategories || []);

      const processed = processCategoryContent(contentResponse?.categorycontent || []);
      setCategorycontent(processed);
      return {
        categories: categoriesResponse?.categories || [],
        subcategories: subcategoriesResponse?.subcategories || [],
        categorycontent: processed,
      };
    } catch (e) {
      console.error("Error fetching data:", e);
      return { categories: [], subcategories: [], categorycontent: [] };
    } finally {
      setLoading(false);
    }
  }, [processCategoryContent]);

  useEffect(() => {
    // initial empty inputs for first main category
    setInputValues(getEmptyValues());
  }, [getEmptyValues]);

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  // Fast lookup for content by key (maincategory_id + category_id)
  const contentMap = useMemo(() => {
    const map = new Map();
    categorycontent.forEach((x) => {
      map.set(`${toNum(x.maincategory_id)}_${toNum(x.category_id)}`, x);
    });
    return map;
  }, [categorycontent]);

  const getCategoryContentDefaults = useCallback(
    (categoryId = selectedCategory?.id) => {
      const empty = getEmptyValues();
      if (!selectedMainCategory || !categoryId) return empty;
      const mId = toNum(selectedMainCategory.value);
      const cId = toNum(categoryId);
      const baseEntry = contentMap.get(`${mId}_${cId}`);
      return baseEntry?.categorycontent ? { ...empty, ...baseEntry.categorycontent } : empty;
    },
    [selectedMainCategory, selectedCategory, contentMap, getEmptyValues]
  );

  const getSubcategoryContentDefaults = useCallback(
    (categoryId, subcategoryId) => {
      const categoryDefaults = getCategoryContentDefaults(categoryId);
      if (!selectedMainCategory || !categoryId || !subcategoryId) return categoryDefaults;
      const mId = toNum(selectedMainCategory.value);
      const cId = toNum(categoryId);
      const baseEntry = contentMap.get(`${mId}_${cId}`);
      const subOverride = (baseEntry?.subcategorycontent || []).find(
        (sc) => toNum(sc.subcategory_id) === toNum(subcategoryId)
      );
      if (!subOverride) return categoryDefaults;
      const { subcategory_id, ...rest } = subOverride;
      return { ...categoryDefaults, ...rest };
    },
    [selectedMainCategory, contentMap, getCategoryContentDefaults]
  );

  // Filter lists
  const filteredCategories = useMemo(() => {
    const mId = toNum(selectedMainCategory?.value);
    if (!mId) return [];
    return category.filter((c) => toNum(c.maincategory_id) === mId);
  }, [category, selectedMainCategory]);

  const filteredSubcategories = useMemo(() => {
    const cId = toNum(selectedCategory?.id);
    if (!cId) return [];
    return subcategory.filter((s) => toNum(s.category_id) === cId);
  }, [subcategory, selectedCategory]);

  // ✅ This is the key fix: always load categorycontent even if no subcategories.
  useEffect(() => {
    setContentExists(false);
    setContentId(null);
    setCurrentContent(null);

    // if main/category not selected, reset inputs
    if (!selectedMainCategory || !selectedCategory) {
      setInputValues(getEmptyValues());
      return;
    }

    const mId = toNum(selectedMainCategory.value);
    const cId = toNum(selectedCategory.id);
    const baseEntry = contentMap.get(`${mId}_${cId}`) || null;

    if (!selectedSubcategory) {
      // === category level ===
      if (baseEntry) {
        setContentExists(true);
        setContentId(baseEntry.id);
        setCurrentContent(baseEntry);
        setInputValues(baseEntry.categorycontent || getEmptyValues());
      } else {
        setInputValues(getEmptyValues());
      }
      return;
    }

    // === subcategory level ===
    if (!baseEntry) {
      setInputValues(getEmptyValues());
      return;
    }

    const sId = toNum(selectedSubcategory.id);
    const subOverride = (baseEntry.subcategorycontent || []).find(
      (sc) => toNum(sc.subcategory_id) === sId
    );

    if (subOverride) {
      // subcategory has its own content
      setContentExists(true);
      setContentId(baseEntry.id);
      setCurrentContent(baseEntry);
      setInputValues(subOverride);
    } else {
      // ✅ no subcategory override => fall back to categorycontent (THIS makes it show)
      setContentExists(false); // because override not saved yet
      setContentId(baseEntry.id);
      setCurrentContent(baseEntry);
      setInputValues(baseEntry.categorycontent || getEmptyValues());
    }
  }, [selectedMainCategory, selectedCategory, selectedSubcategory, contentMap, getEmptyValues]);

  const handleMainCategoryClick = (mainCat) => {
    setSelectedMainCategory(mainCat);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setShowDeleteConfirm(false);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    setShowDeleteConfirm(false);
  };

  const handleSubcategoryClick = (sub) => {
    setSelectedSubcategory(sub);
    setShowDeleteConfirm(false);
  };

  const handleInputChange = (key, value) => {
    setInputValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleModalInputChange = (setter, key, value) => {
    setter((prev) => ({ ...prev, [key]: value }));
  };

  const findLatestCategoryByName = (items, name, maincategoryId) => {
    const matches = (items || []).filter(
      (cat) => cat?.name === name && toNum(cat?.maincategory_id) === toNum(maincategoryId)
    );
    if (matches.length === 0) return null;
    return matches.reduce((acc, item) => (toNum(item.id) > toNum(acc.id) ? item : acc));
  };

  const findLatestSubcategoryByName = (items, name, categoryId) => {
    const matches = (items || []).filter(
      (sub) => sub?.name === name && toNum(sub?.category_id) === toNum(categoryId)
    );
    if (matches.length === 0) return null;
    return matches.reduce((acc, item) => (toNum(item.id) > toNum(acc.id) ? item : acc));
  };

  const handleSaveCategoryContent = async () => {
    if (!selectedMainCategory || !selectedCategory) return;

    setActionLoading(true);
    try {
      const requestData = {
        maincategory_id: toTextId(selectedMainCategory.value),
        category_id: toTextId(selectedCategory.id),
      };

      if (!selectedSubcategory) {
        requestData.categorycontent = normalizeNumericFieldsByConfig(
          inputValues,
          selectedMainCategory
        );
      } else {
        requestData.subcategory_id = toNum(selectedSubcategory.id);
        requestData.subcategorycontent = normalizeNumericFieldsByConfig(
          inputValues,
          selectedMainCategory
        );

        // keep categorycontent intact when saving a subcategory override
        requestData.categorycontent = currentContent?.categorycontent || getEmptyValues();
      }

      await backendAccessPost("api/categorycontent/add_or_update/", requestData);

      // ✅ refresh so UI always reflects saved data
      await refetchAll();
      setContentExists(true);
    } catch (e) {
      console.error("Error saving category content:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!namecategory || !selectedMainCategory) return;

    setActionLoading(true);
    try {
      await backendAccessPost("api/category/add/", {
        name: namecategory,
        maincategory_id: toNum(selectedMainCategory.value),
      });
      const data = await refetchAll();

      const newCategory = findLatestCategoryByName(
        data.categories,
        namecategory,
        selectedMainCategory.value
      );

      if (newCategory) {
        await backendAccessPost("api/categorycontent/add_or_update/", {
          maincategory_id: toTextId(selectedMainCategory.value),
          category_id: toTextId(newCategory.id),
          categorycontent: mergeContentValues(addCategoryContentValues),
        });
        await refetchAll();
        setSelectedCategory(newCategory);
        setSelectedSubcategory(null);
      }

      setnamecategory("");
      setAddCategoryContentValues(getEmptyValues());
      setShowAddModal(false);
    } catch (e) {
      console.error("Error adding category:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!namecategory || !editingCategory) return;

    setActionLoading(true);
    try {
      await backendAccessPost("api/category/update/", {
        id: toNum(editingCategory.id),
        name: namecategory,
      });
      if (selectedMainCategory) {
        await backendAccessPost("api/categorycontent/add_or_update/", {
          maincategory_id: toTextId(selectedMainCategory.value),
          category_id: toTextId(editingCategory.id),
          categorycontent: mergeContentValues(editCategoryContentValues),
        });
      }
      await refetchAll();
      setnamecategory("");
      setShowEditCategoryModal(false);
      setEditingCategory(null);
    } catch (e) {
      console.error("Error updating category:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!namesubcategory || !selectedCategory || !selectedMainCategory) return;

    setActionLoading(true);
    try {
      await backendAccessPost("api/subcategory/add/", {
        name: namesubcategory,
        category_id: toNum(selectedCategory.id),
      });
      const data = await refetchAll();
      const newSubcategory = findLatestSubcategoryByName(
        data.subcategories,
        namesubcategory,
        selectedCategory.id
      );

      if (newSubcategory) {
        await backendAccessPost("api/categorycontent/add_or_update/", {
          maincategory_id: toTextId(selectedMainCategory.value),
          category_id: toTextId(selectedCategory.id),
          subcategory_id: toNum(newSubcategory.id),
          subcategorycontent: mergeContentValues(addSubcategoryContentValues),
        });
        await refetchAll();
        setSelectedSubcategory(newSubcategory);
      }

      setnamesubcategory("");
      setAddSubcategoryContentValues(getCategoryContentDefaults(selectedCategory.id));
      setShowSubcategoryModal(false);
    } catch (e) {
      console.error("Error adding subcategory:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!namesubcategory || !editingSubcategory) return;

    setActionLoading(true);
    try {
      await backendAccessPost("api/subcategory/update/", {
        id: toNum(editingSubcategory.id),
        name: namesubcategory,
      });
      if (selectedMainCategory) {
        const categoryId = editingSubcategory.category_id || selectedCategory?.id;
        if (categoryId) {
          await backendAccessPost("api/categorycontent/add_or_update/", {
            maincategory_id: toTextId(selectedMainCategory.value),
            category_id: toTextId(categoryId),
            subcategory_id: toNum(editingSubcategory.id),
            subcategorycontent: mergeContentValues(editSubcategoryContentValues),
          });
        }
      }
      await refetchAll();
      setnamesubcategory("");
      setShowEditSubcategoryModal(false);
      setEditingSubcategory(null);
    } catch (e) {
      console.error("Error updating subcategory:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!itemToDelete) return;

    setActionLoading(true);
    try {
      await backendAccessPost("api/category/delete/", { id: toNum(itemToDelete.id) });
      await refetchAll();

      if (selectedCategory?.id === itemToDelete.id) {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
      }

      setShowEditCategoryModal(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setDeleteType("");
    } catch (e) {
      console.error("Error deleting category:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!itemToDelete) return;

    setActionLoading(true);
    try {
      await backendAccessPost("api/subcategory/delete/", { id: toNum(itemToDelete.id) });

      // if there is categorycontent entry, remove override for this subcategory too
      if (selectedCategory && selectedMainCategory) {
        const mId = toNum(selectedMainCategory.value);
        const cId = toNum(selectedCategory.id);
        const baseEntry = contentMap.get(`${mId}_${cId}`);

        if (baseEntry) {
          const updated = (baseEntry.subcategorycontent || []).filter(
            (sc) => toNum(sc.subcategory_id) !== toNum(itemToDelete.id)
          );

          await backendAccessPost("api/categorycontent/add_or_update/", {
            maincategory_id: toTextId(mId),
            category_id: toTextId(cId),
            categorycontent: baseEntry.categorycontent || getEmptyValues(),
            subcategorycontent: updated,
          });
        }
      }

      await refetchAll();

      if (selectedSubcategory?.id === itemToDelete.id) {
        setSelectedSubcategory(null);
      }

      setShowEditSubcategoryModal(false);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setDeleteType("");
    } catch (e) {
      console.error("Error deleting subcategory:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setnamecategory(cat.name);
    setEditCategoryContentValues(getCategoryContentDefaults(cat.id));
    setShowEditCategoryModal(true);
    setShowDeleteConfirm(false);
  };

  const handleOpenEditSubcategoryModal = (sub) => {
    setEditingSubcategory(sub);
    setnamesubcategory(sub.name);
    setEditSubcategoryContentValues(getSubcategoryContentDefaults(sub.category_id, sub.id));
    setShowEditSubcategoryModal(true);
    setShowDeleteConfirm(false);
  };

  const handleInitiateDelete = (type, item) => {
    setDeleteType(type);
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteType === "category") await handleDeleteCategory();
    if (deleteType === "subcategory") await handleDeleteSubcategory();
  };

  const renderConfigInputs = (values, onChange) => {
    if (!selectedMainCategory || !Array.isArray(selectedMainCategory.content)) return null;

    return selectedMainCategory.content.map((field) => (
      <Input
        key={field.key}
        label={field.label}
        type={field.type}
        value={values?.[field.key] ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        width={210}
        labelAlign="center"
        labelPosition="above"
        required
      />
    ));
  };

  const renderInputFields = () => renderConfigInputs(inputValues, handleInputChange);

  return (
    <div className="flex flex-col space-y-[15px]">
      {/* optional loading indicator */}
      {loading && <div className="text-[10px] body-farsi-bold">در حال بارگذاری...</div>}

      <div className="flex space-x-[15px] space-x-reverse">
        {/* Main categories */}
        <div className="flex flex-col space-y-[15px]">
          <Box width={360} height={"245px"}>
            <div className="flex flex-col space-y-[15px] justify-center items-center p-[10px]">
              <h3 className="text-[10px] body-farsi-bold">دسته بندی ها</h3>
              <div className="space-y-1">
                {mainCategoryConfig.map((cat) => (
                  <div
                    key={cat.value}
                    onClick={() => handleMainCategoryClick(cat)}
                    className={`flex justify-center items-center cursor-pointer rounded text-[10px] w-[200px] h-[26px] border-[0.5px] border-[#9d9d9d80] text-center ${
                      selectedMainCategory?.value === cat.value
                        ? "bg-[#872BFF] text-[#fff]"
                        : "hover:bg-[#fff] hover:border-[#872BFF]"
                    }`}
                  >
                    {cat.label}
                  </div>
                ))}
              </div>
            </div>
          </Box>
        </div>

        {/* Categories + subcategories */}
        <Box width={445} height={"225px"}>
          <div className="flex space-x-[5px] space-x-reverse w-full p-[10px]">
            {/* category list */}
            <div className={`flex flex-col ${selectedMainCategory ? "space-y-[5px]" : ""}`}>
              <h3 className="text-[10px] body-farsi-bold px-[10px]">نوع دسته بندی</h3>

              {filteredCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div
                    onClick={() => handleCategoryClick(cat)}
                    className={`flex justify-center items-center cursor-pointer p-1 rounded text-[10px] w-[200px] h-[26px] border-[0.5px] border-[#9d9d9d80] text-center ${
                      selectedCategory?.id === cat.id
                        ? "bg-[#872BFF] text-[#fff]"
                        : "hover:bg-[#fff] hover:border-[#872BFF]"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditCategoryModal(cat);
                      }}
                      className={`p-1 ${
                        selectedCategory?.id === cat.id
                          ? "bg-[#872BFF] text-[#fff]"
                          : "text-[#9c9c9c] hover:bg-[#872BFF] hover:text-[#fff]"
                      }`}
                    >
                      <FiEdit2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {selectedMainCategory && (
                <button
                  onClick={() => {
                    setAddCategoryContentValues(getEmptyValues());
                    setnamecategory("");
                    setShowAddModal(true);
                  }}
                  className="flex items-center justify-center gap-[5px] border-[0.5px] border-[#872BFF90] text-[#872BFF] w-[200px] h-[26px] text-[10px] rounded-[2px]"
                >
                  <AiOutlinePlus size={15} />
                  <span className="text-[10px] body-farsi-bold">اضافه کردن</span>
                </button>
              )}
            </div>

            {/* subcategory list */}
            <div className={`flex ${selectedCategory ? "flex-col space-y-[5px]" : ""}`}>
              <h3 className="text-[10px] body-farsi-bold px-[10px]">دسته بندی</h3>

              {filteredSubcategories.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between">
                  <div
                    onClick={() => handleSubcategoryClick(sub)}
                    className={`flex justify-center items-center cursor-pointer p-1 rounded text-[10px] w-[200px] h-[26px] border-[0.5px] border-[#9d9d9d80] text-center ${
                      selectedSubcategory?.id === sub.id
                        ? "bg-[#872BFF] text-[#fff]"
                        : "hover:bg-[#872BFF] hover:text-[#fff]"
                    }`}
                  >
                    <span>{sub.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditSubcategoryModal(sub);
                      }}
                      className={`p-1 ${
                        selectedSubcategory?.id === sub.id
                          ? "bg-[#872BFF] text-[#fff]"
                          : "text-[#9c9c9c] hover:bg-[#872BFF] hover:text-[#fff]"
                      }`}
                    >
                      <FiEdit2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {selectedCategory && (
                <button
                  onClick={() => {
                    setAddSubcategoryContentValues(getCategoryContentDefaults(selectedCategory.id));
                    setnamesubcategory("");
                    setShowSubcategoryModal(true);
                  }}
                  className="flex items-center justify-center gap-[5px] border-[0.5px] border-[#872BFF90] text-[#872BFF] w-[200px] h-[26px] text-[10px] rounded-[2px]"
                >
                  <AiOutlinePlus size={15} />
                  <span className="text-[10px] body-farsi-bold">اضافه کردن</span>
                </button>
              )}
            </div>
          </div>
        </Box>

        {/* Content editor */}
        <Box width={246} height={"auto"}>
          <div className="text-[10px] p-[5px] body-farsi-bold">
            <span>
              {selectedCategory?.name}
              {selectedSubcategory?.name ? <span> | {selectedSubcategory?.name}</span> : null}
            </span>
          </div>

          <div className="flex flex-col space-y-[5px] w-full p-[10px]">
            {renderInputFields()}

            <div className="flex justify-center w-full py-[10px]">
              <button
                onClick={handleSaveCategoryContent}
                className="bg-[#872BFF] w-[200px] text-white text-xs py-1 rounded-[2px]"
                disabled={!selectedMainCategory || !selectedCategory || actionLoading}
              >
                {actionLoading ? "پردازش..." : contentExists ? "به‌روزرسانی" : "تایید"}
              </button>
            </div>
          </div>
        </Box>
      </div>

      {/* ===================== MODALS (kept same behavior) ===================== */}
      {showAddModal && (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
            <div className="relative w-[400px] h-[300px]">
              <div className="flex flex-col space-y-[5px] py-[15px] justify-center items-center border-0 rounded-[15px] shadow-lg relative w-full bg-[#F8F8F8] outline-none focus:outline-none">
                <Input
                  label="نام دسته بندی"
                  onChange={(e) => setnamecategory(e.target.value)}
                  width={205}
                  labelAlign="center"
                />
                {renderConfigInputs(addCategoryContentValues, (key, value) =>
                  handleModalInputChange(setAddCategoryContentValues, key, value)
                )}
                <div className="flex space-x-[4px] space-x-reverse justify-center">
                  <button
                    className="bg-[#872BFF] w-[100px] text-white uppercase text-[10px] h-[25px] px-6 rounded-[2px]"
                    type="button"
                    onClick={handleAddCategory}
                    disabled={actionLoading}
                  >
                    {actionLoading ? " ذخیره..." : "ذخیره"}
                  </button>
                  <button
                    className="text-[#fff] w-[100px] rounded-[2px] bg-[#000] uppercase px-6 h-[25px] text-[10px]"
                    type="button"
                    onClick={() => setShowAddModal(false)}
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
        </>
      )}

      {showEditCategoryModal && (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
            <div className="relative w-[400px] h-[300px]">
              <div className="border-0 p-[10px] rounded-[20px] shadow-lg relative flex flex-col space-y-[5px] w-full bg-[#F8F8F8] outline-none focus:outline-none">
                {!showDeleteConfirm ? (
                  <>
                    <div className="flex justify-center">
                      <Input
                        label="نام دسته بندی"
                        value={namecategory}
                        onChange={(e) => setnamecategory(e.target.value)}
                        width={205}
                        labelAlign="center"
                      />
                    </div>
                    {renderConfigInputs(editCategoryContentValues, (key, value) =>
                      handleModalInputChange(setEditCategoryContentValues, key, value)
                    )}
                  </>
                ) : (
                  <div className="flex flex-col justify-center text-center p-[10px]">
                    <p className="text-[10px]">آیا از حذف دسته بندی "{editingCategory?.name}" اطمینان دارید؟</p>
                    <p className="text-[10px] mb-[10px] text-[#872BFF]">
                      توجه: با حذف این دسته بندی، تمام زیردسته‌ها و محتوای مرتبط با آن نیز حذف خواهند شد.
                    </p>
                  </div>
                )}

                <div className="flex space-x-[4px] space-x-reverse justify-center">
                  {!showDeleteConfirm ? (
                    <button
                      className="bg-[#872BFF] w-[100px] text-white uppercase text-[10px] h-[25px] px-6 rounded-[2px]"
                      type="button"
                      onClick={handleUpdateCategory}
                      disabled={actionLoading}
                    >
                      به‌روزرسانی
                    </button>
                  ) : (
                    <button
                      className="bg-[#872BFF] w-[100px] text-white uppercase text-[10px] h-[25px] px-6 rounded-[2px]"
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={actionLoading}
                    >
                      {actionLoading ? " حذف..." : "تایید حذف"}
                    </button>
                  )}

                  <button
                    className="text-[#fff] w-[100px] rounded-[2px] bg-[#000] uppercase px-6 h-[25px] text-[10px]"
                    type="button"
                    onClick={() => {
                      setShowEditCategoryModal(false);
                      setShowDeleteConfirm(false);
                    }}
                  >
                    {showDeleteConfirm ? "انصراف" : "بستن"}
                  </button>
                </div>

                {!showDeleteConfirm && (
                  <div className="w-full px-[10px]">
                    <button
                      className="float-end outline-none focus:outline-none"
                      type="button"
                      onClick={() => handleInitiateDelete("category", editingCategory)}
                    >
                      <FiTrash2 size={12} color={"#872BFF"} className="inline ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
        </>
      )}

      {showSubcategoryModal && (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
            <div className="relative w-[400px] h-[300px]">
              <div className="border-0 p-[10px] items-center rounded-[20px] shadow-lg relative flex flex-col space-y-[5px] w-full bg-[#F8F8F8] outline-none focus:outline-none">
                <Input
                  label="نام زیر دسته بندی:"
                  onChange={(e) => setnamesubcategory(e.target.value)}
                  required
                  width={210}
                  labelAlign="center"
                />
                {renderConfigInputs(addSubcategoryContentValues, (key, value) =>
                  handleModalInputChange(setAddSubcategoryContentValues, key, value)
                )}

                <div className="flex space-x-[4px] space-x-reverse justify-center">
                  <button
                    className="bg-[#872BFF] text-white uppercase text-[10px] h-[25px] px-6 rounded-[2px]"
                    type="button"
                    onClick={handleAddSubcategory}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "ذخیره..." : "ذخیره"}
                  </button>
                  <button
                    className="text-[#fff] rounded-[2px] bg-[#000] uppercase px-6 h-[25px] text-[10px]"
                    type="button"
                    onClick={() => setShowSubcategoryModal(false)}
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
        </>
      )}

      {showEditSubcategoryModal && (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
            <div className="relative w-[400px] h-[300px]">
              <div className="border-0 p-[15px] rounded-[20px] shadow-lg relative flex flex-col space-y-[5px] w-full bg-[#F8F8F8] outline-none focus:outline-none">
                {!showDeleteConfirm ? (
                  <>
                    <div className="flex justify-center">
                      <Input
                        label="نام زیر دسته بندی"
                        value={namesubcategory}
                        onChange={(e) => setnamesubcategory(e.target.value)}
                        required
                        width={205}
                        labelAlign="center"
                      />
                    </div>
                    {renderConfigInputs(editSubcategoryContentValues, (key, value) =>
                      handleModalInputChange(setEditSubcategoryContentValues, key, value)
                    )}
                  </>
                ) : (
                  <div className="flex flex-col justify-center text-center p-[20px]">
                    <p className="text-[10px]">آیا از حذف زیر دسته بندی "{editingSubcategory?.name}" اطمینان دارید؟</p>
                    <p className="text-[10px] text-[#872BFF]">توجه: با حذف این زیر دسته بندی، محتوای مرتبط با آن نیز حذف خواهد شد.</p>
                  </div>
                )}

                <div className="flex items-center justify-center">
                  {!showDeleteConfirm ? (
                    <button
                      className="bg-[#872BFF] w-[100px] text-white uppercase text-[10px] h-[25px] px-6 rounded-[2px]"
                      type="button"
                      onClick={handleUpdateSubcategory}
                      disabled={actionLoading}
                    >
                      به‌روزرسانی
                    </button>
                  ) : (
                    <button
                      className="bg-[#872BFF] text-white uppercase text-[10px] h-[25px] px-6 rounded-[2px]"
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={actionLoading}
                    >
                      {actionLoading ? " حذف..." : "تایید حذف"}
                    </button>
                  )}

                  <button
                    className="text-[#fff] rounded-[2px] bg-[#000] w-[100px] uppercase px-6 h-[25px] text-[10px]"
                    type="button"
                    onClick={() => {
                      setShowEditSubcategoryModal(false);
                      setShowDeleteConfirm(false);
                    }}
                  >
                    {showDeleteConfirm ? "انصراف" : "بستن"}
                  </button>
                </div>

                {!showDeleteConfirm && (
                  <div className="w-full px-[10px]">
                    <button
                      className="float-end outline-none focus:outline-none"
                      type="button"
                      onClick={() => handleInitiateDelete("subcategory", editingSubcategory)}
                    >
                      <FiTrash2 size={12} color={"#872BFF"} className="inline ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
        </>
      )}
    </div>
  );
};

export default Category;
