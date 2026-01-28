// Tất cả logic frontend cho trang fitness

document.addEventListener("DOMContentLoaded", function () {
    const bmiForm = document.getElementById("bmi-form");
    const bmiResult = document.getElementById("bmi-result");
    const bmiValueSpan = document.getElementById("bmi-value");
    const bmiCategorySpan = document.getElementById("bmi-category");
    const bmiSummary = document.getElementById("bmi-summary");
    const bmiDetails = document.getElementById("bmi-details");
    const bmiRisks = document.getElementById("bmi-risks");
    const bmiFoods = document.getElementById("bmi-foods");

    if (!bmiForm) return;

    bmiForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const age = parseInt(document.getElementById("age").value, 10);
        const heightCm = parseFloat(document.getElementById("height").value);
        const weight = parseFloat(document.getElementById("weight").value);
        const activity = document.getElementById("activity").value;

        if (!age || !heightCm || !weight) {
            alert("Vui lòng nhập đầy đủ tuổi, chiều cao và cân nặng.");
            return;
        }

        const heightM = heightCm / 100;
        const bmi = weight / (heightM * heightM);
        const bmiRounded = bmi.toFixed(1);

        const category = getBmiCategory(bmi);
        const summaryText = getSummaryText(category, activity);
        const detailsList = getDetailsList(category, age, activity);
        const profile = BMI_PROFILES[category.key];

        bmiValueSpan.textContent = bmiRounded;
        bmiCategorySpan.textContent = category.label;
        bmiCategorySpan.className = category.badgeClass;
        bmiSummary.textContent = summaryText;

        // Xóa chi tiết cũ
        while (bmiDetails.firstChild) {
            bmiDetails.removeChild(bmiDetails.firstChild);
        }
        while (bmiRisks.firstChild) {
            bmiRisks.removeChild(bmiRisks.firstChild);
        }
        while (bmiFoods.firstChild) {
            bmiFoods.removeChild(bmiFoods.firstChild);
        }

        // Thêm chi tiết mới
        detailsList.forEach(function (item) {
            const li = document.createElement("li");
            li.textContent = item;
            bmiDetails.appendChild(li);
        });

        // Thêm danh sách nguy cơ sức khỏe
        if (profile && Array.isArray(profile.risks)) {
            profile.risks.forEach(function (risk) {
                const li = document.createElement("li");
                li.textContent = risk;
                bmiRisks.appendChild(li);
            });
        }

        // Thêm thực phẩm minh họa
        if (profile && Array.isArray(profile.foods)) {
            profile.foods.forEach(function (food) {
                const col = document.createElement("div");
                col.className = "col-6";

                const card = document.createElement("div");
                card.className = "card bmi-food-card h-100";

                const img = document.createElement("img");
                img.className = "card-img-top";
                img.src = food.image;
                img.alt = food.name;

                const body = document.createElement("div");
                body.className = "card-body py-2";

                const title = document.createElement("h6");
                title.className = "card-title small mb-1";
                title.textContent = food.name;

                const desc = document.createElement("p");
                desc.className = "card-text small mb-0";
                desc.textContent = food.description;

                body.appendChild(title);
                body.appendChild(desc);
                card.appendChild(img);
                card.appendChild(body);
                col.appendChild(card);
                bmiFoods.appendChild(col);
            });
        }

        bmiResult.classList.remove("d-none");
        bmiResult.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

/**
 * Phân loại BMI dựa trên giá trị
 * @param {number} bmi
 * @returns {{label: string, badgeClass: string, key: string}}
 */
function getBmiCategory(bmi) {
    if (bmi < 18.5) {
        return { label: "Thiếu cân", badgeClass: "badge bg-warning text-dark", key: "underweight" };
    }
    if (bmi < 23) {
        return { label: "Bình thường (khỏe mạnh)", badgeClass: "badge bg-success", key: "normal" };
    }
    if (bmi < 25) {
        return { label: "Thừa cân nhẹ", badgeClass: "badge bg-warning text-dark", key: "overweight" };
    }
    return { label: "Thừa cân / Béo phì", badgeClass: "badge bg-danger", key: "obese" };
}

/**
 * Gợi ý tổng quan theo BMI + mức vận động
 * @param {{label: string}} category
 * @param {"low"|"medium"|"high"} activity
 * @returns {string}
 */
function getSummaryText(category, activity) {
    let base = "";

    switch (category.label) {
        case "Thiếu cân":
            base = "Bạn đang ở mức thiếu cân. Cần tăng năng lượng nạp vào, ưu tiên protein và carb tốt để tăng cân lành mạnh.";
            break;
        case "Bình thường (khỏe mạnh)":
            base = "Bạn đang ở mức BMI khỏe mạnh. Hãy duy trì chế độ ăn cân bằng và tập luyện đều đặn.";
            break;
        case "Thừa cân nhẹ":
            base = "Bạn đang hơi thừa cân. Nên điều chỉnh khẩu phần, giảm đồ ngọt và tăng vận động.";
            break;
        default:
            base = "Bạn đang ở mức thừa cân/béo phì. Hãy ưu tiên giảm mỡ bằng cách kiểm soát calo và tăng hoạt động thể chất.";
            break;
    }

    let add = "";
    if (activity === "low") {
        add = " Mức vận động hiện tại còn thấp, bạn nên bắt đầu với 20–30 phút đi bộ nhanh hoặc vận động nhẹ mỗi ngày.";
    } else if (activity === "medium") {
        add = " Bạn đã có thói quen tập luyện khá tốt, hãy kết hợp thêm bài tập sức mạnh (tạ, bodyweight) 2–3 buổi/tuần.";
    } else {
        add = " Mức vận động cao, hãy chú ý phục hồi bằng giấc ngủ đủ, bổ sung protein và vitamin để tránh quá tải cơ thể.";
    }

    return base + add;
}

/**
 * Danh sách gợi ý chi tiết dựa trên BMI + tuổi + vận động
 * @param {{label: string}} category
 * @param {number} age
 * @param {"low"|"medium"|"high"} activity
 * @returns {string[]}
 */
function getDetailsList(category, age, activity) {
    const details = [];

    // Gợi ý theo BMI
    if (category.label === "Thiếu cân") {
        details.push("Tăng 200–400 kcal/ngày so với nhu cầu hiện tại.");
        details.push("Mỗi bữa nên có nguồn protein (thịt nạc, cá, trứng, đậu) và carb tốt (gạo lứt, khoai, yến mạch).");
        details.push("Thêm các bữa phụ như sữa chua, hạt, sinh tố trái cây ít đường.");
    } else if (category.label === "Bình thường (khỏe mạnh)") {
        details.push("Duy trì tỉ lệ 40–50% carb tốt, 25–30% protein, 20–30% chất béo tốt.");
        details.push("Ăn nhiều rau xanh, trái cây tươi để tăng vitamin, chất xơ.");
        details.push("Hạn chế đồ uống có đường, thức ăn nhanh nhiều dầu mỡ.");
    } else if (category.label === "Thừa cân nhẹ") {
        details.push("Giảm 200–300 kcal/ngày, ưu tiên bớt đồ ngọt, nước ngọt, đồ chiên.");
        details.push("Tăng khẩu phần rau, chất xơ để no lâu và ổn định đường huyết.");
        details.push("Kết hợp đi bộ nhanh, đạp xe hoặc bơi 30–45 phút, 3–4 buổi/tuần.");
    } else {
        details.push("Tập trung giảm calo từ đồ ăn vặt, nước ngọt, rượu bia.");
        details.push("Ưu tiên hấp/luộc/nướng thay cho chiên rán, tăng lượng rau và đạm nạc.");
        details.push("Tham khảo thêm ý kiến chuyên gia dinh dưỡng nếu có bệnh lý nền.");
    }

    // Gợi ý theo độ tuổi
    if (age < 25) {
        details.push("Thiết lập thói quen ăn uống lành mạnh sớm sẽ giúp bạn duy trì vóc dáng và sức khỏe lâu dài.");
        details.push("Hạn chế thức khuya, đồ uống tăng lực và đồ ăn nhanh khi học tập/làm việc.");
    } else if (age <= 40) {
        details.push("Cân bằng giữa công việc và sức khỏe: lên lịch tập cố định trong tuần.");
        details.push("Chú ý kiểm soát vòng bụng, vì mỡ nội tạng tăng nguy cơ tim mạch và tiểu đường.");
    } else {
        details.push("Ưu tiên thực phẩm dễ tiêu, ít muối, ít đường và giàu chất xơ.");
        details.push("Kết hợp đi bộ nhẹ nhàng, yoga hoặc giãn cơ để cải thiện tuần hoàn và giấc ngủ.");
    }

    // Gợi ý thêm theo mức vận động
    if (activity === "high") {
        details.push("Bổ sung đủ protein sau tập (20–30g) để phục hồi cơ bắp.");
        details.push("Đảm bảo ngủ tối thiểu 7 tiếng/đêm để hệ thần kinh và hormone ổn định.");
    }

    return details;
}

// Hồ sơ chi tiết cho từng nhóm BMI: nguy cơ sức khỏe + ví dụ thực phẩm
const BMI_PROFILES = {
    underweight: {
        risks: [
            "Có thể bị suy dinh dưỡng nếu kéo dài, dễ mệt mỏi và hoa mắt chóng mặt.",
            "Giảm khối lượng cơ, ảnh hưởng sức mạnh và hiệu suất tập luyện.",
            "Hệ miễn dịch suy yếu, dễ mắc bệnh nhiễm trùng, lâu hồi phục."
        ],
        foods: [
            {
                name: "Sinh tố bơ + sữa chua",
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
                description: "Giàu năng lượng, chất béo tốt và vitamin, thích hợp làm bữa phụ tăng cân lành mạnh."
            },
            {
                name: "Cơm gạo lứt + ức gà + rau",
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                description: "Kết hợp carb tốt và protein nạc giúp tăng khối lượng cơ và phục hồi sau tập."
            }
        ]
    },
    normal: {
        risks: [
            "Nếu duy trì thói quen tốt, nguy cơ bệnh mạn tính tương đối thấp.",
            "Tuy nhiên, ít vận động hoặc ăn uống thất thường vẫn có thể làm tăng mỡ bụng và rối loạn mỡ máu."
        ],
        foods: [
            {
                name: "Đĩa rau củ nhiều màu + cá/đậu phụ",
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
                description: "Giữ cân bằng giữa đạm, chất xơ và chất béo tốt, giúp duy trì cân nặng lý tưởng."
            },
            {
                name: "Yến mạch + trái cây + hạt",
                image: "https://cooponline.vn/tin-tuc/wp-content/uploads/2025/09/image.png",
                description: "Bữa sáng lành mạnh, hỗ trợ kiểm soát đường huyết và no lâu đến trưa."
            }
        ]
    },
    overweight: {
        risks: [
            "Thừa cân nhẹ làm tăng dần nguy cơ tăng huyết áp, rối loạn mỡ máu.",
            "Khớp gối, cột sống dễ bị quá tải nếu vận động mạnh, dễ đau nhức."
        ],
        foods: [
            {
                name: "Salad rau xanh + ức gà áp chảo",
                image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
                description: "Giàu đạm và chất xơ, ít calo, hỗ trợ giảm mỡ nhưng vẫn no lâu."
            },
            {
                name: "Khoai lang nướng + trứng luộc",
                image: "https://nreci.org/wp-content/uploads/2024/02/thuc-don-giam-can-voi-khoai-lang-va-trung-1.webp",
                description: "Bữa phụ giàu dinh dưỡng, thay thế đồ ăn vặt nhiều đường và dầu mỡ."
            }
        ]
    },
    obese: {
        risks: [
            "Tăng nguy cơ bệnh tim mạch, tiểu đường type 2, gan nhiễm mỡ, huyết áp cao.",
            "Dễ khó thở, ngủ ngáy, chất lượng giấc ngủ kém, ảnh hưởng tinh thần và hiệu suất làm việc.",
            "Gia tăng áp lực lên khớp gối, cột sống, dễ đau mỏi kéo dài."
        ],
        foods: [
            {
                name: "Đĩa rau luộc + cá hấp",
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
                description: "Ít calo, nhiều chất xơ và đạm nạc, phù hợp khi cần giảm cân từ từ và bền vững."
            },
            {
                name: "Salad ngũ cốc nguyên cám",
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
                description: "Kết hợp hạt, đậu, rau củ giúp no lâu, hạn chế cảm giác thèm đồ ngọt và tinh bột tinh chế."
            }
        ]
    }

};

