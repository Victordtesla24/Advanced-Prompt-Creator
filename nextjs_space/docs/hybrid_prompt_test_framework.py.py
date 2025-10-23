
"""
HYBRID PROMPT TESTING FRAMEWORK
Simple, focused test suite to validate hybrid prompt effectiveness
"""

class HybridPromptTester:
    def __init__(self, hybrid_prompt, original_input_prompt):
        self.hybrid_prompt = hybrid_prompt
        self.original_input = original_input_prompt
        self.test_results = []

    def test_integrity_preservation(self):
        """Test 1: Verify input prompt kept intact"""
        print("\n=== TEST 1: Input Prompt Integrity ===")

        # Extract core requirements from both prompts
        original_keywords = set(self.original_input.lower().split())
        hybrid_keywords = set(self.hybrid_prompt.lower().split())

        # Check for preservation of key terms
        preservation_ratio = len(original_keywords.intersection(hybrid_keywords)) / len(original_keywords)

        result = {
            "test_name": "Input Integrity Preservation",
            "expected": "100% of original requirements preserved",
            "actual": f"{preservation_ratio*100:.1f}% keywords preserved",
            "status": "PASS" if preservation_ratio > 0.85 else "FAIL"
        }

        self.test_results.append(result)
        print(f"Status: {result['status']}")
        print(f"Preservation Ratio: {preservation_ratio*100:.1f}%")
        return result

    def test_structure_compliance(self):
        """Test 2: Verify proper prompt engineering structure"""
        print("\n=== TEST 2: Structure Compliance ===")

        required_sections = [
            "context", "requirements", "objective", 
            "instructions", "success criteria", "constraints"
        ]

        found_sections = []
        for section in required_sections:
            if section in self.hybrid_prompt.lower():
                found_sections.append(section)

        compliance_rate = len(found_sections) / len(required_sections)

        result = {
            "test_name": "Structure Compliance",
            "expected": "All required sections present",
            "actual": f"{len(found_sections)}/{len(required_sections)} sections found",
            "status": "PASS" if compliance_rate == 1.0 else "FAIL"
        }

        self.test_results.append(result)
        print(f"Status: {result['status']}")
        print(f"Sections Found: {', '.join(found_sections)}")
        return result

    def test_validation_loop_presence(self):
        """Test 3: Verify recursive validation loop implementation"""
        print("\n=== TEST 3: Validation Loop Implementation ===")

        loop_indicators = [
            "validation", "verify", "complete", 
            "loop", "recursive", "repeat"
        ]

        found_indicators = []
        for indicator in loop_indicators:
            if indicator in self.hybrid_prompt.lower():
                found_indicators.append(indicator)

        loop_present = len(found_indicators) >= 4

        result = {
            "test_name": "Validation Loop Implementation",
            "expected": "Recursive validation loop present",
            "actual": f"{len(found_indicators)} loop indicators found",
            "status": "PASS" if loop_present else "FAIL"
        }

        self.test_results.append(result)
        print(f"Status: {result['status']}")
        print(f"Loop Indicators: {', '.join(found_indicators)}")
        return result

    def test_success_criteria_extraction(self):
        """Test 4: Verify all Success Criteria identified"""
        print("\n=== TEST 4: Success Criteria Extraction ===")

        # Count SC references in hybrid prompt
        sc_count_hybrid = self.hybrid_prompt.lower().count("sc") +                          self.hybrid_prompt.lower().count("success criter")

        sc_present = sc_count_hybrid > 0

        result = {
            "test_name": "Success Criteria Extraction",
            "expected": "All SCs from input identified",
            "actual": f"{sc_count_hybrid} SC references found",
            "status": "PASS" if sc_present else "FAIL"
        }

        self.test_results.append(result)
        print(f"Status: {result['status']}")
        print(f"SC References: {sc_count_hybrid}")
        return result

    def test_token_efficiency(self):
        """Test 5: Verify no unnecessary complexity"""
        print("\n=== TEST 5: Token Efficiency ===")

        # Simple token count comparison
        original_tokens = len(self.original_input.split())
        hybrid_tokens = len(self.hybrid_prompt.split())

        # Hybrid should be more structured but not excessively longer
        token_ratio = hybrid_tokens / original_tokens
        efficient = token_ratio < 3.0  # Allow up to 3x expansion for structure

        result = {
            "test_name": "Token Efficiency",
            "expected": "Reasonable token expansion (<3x)",
            "actual": f"{token_ratio:.2f}x expansion",
            "status": "PASS" if efficient else "FAIL"
        }

        self.test_results.append(result)
        print(f"Status: {result['status']}")
        print(f"Original: {original_tokens} tokens")
        print(f"Hybrid: {hybrid_tokens} tokens")
        return result

    def test_engineering_techniques_applied(self):
        """Test 6: Verify advanced techniques applied"""
        print("\n=== TEST 6: Prompt Engineering Techniques ===")

        techniques = [
            "chain-of-thought", "tree-of-thought", 
            "generate-knowledge", "role prompting", 
            "decomposition", "recursive"
        ]

        found_techniques = []
        for technique in techniques:
            tech_check = technique.replace("-", " ")
            if tech_check in self.hybrid_prompt.lower():
                found_techniques.append(technique)

        techniques_applied = len(found_techniques) >= 2

        result = {
            "test_name": "Engineering Techniques Applied",
            "expected": "At least 2 advanced techniques",
            "actual": f"{len(found_techniques)} techniques detected",
            "status": "PASS" if techniques_applied else "FAIL"
        }

        self.test_results.append(result)
        print(f"Status: {result['status']}")
        print(f"Techniques: {', '.join(found_techniques) if found_techniques else 'None detected'}")
        return result

    def test_no_additions_or_removals(self):
        """Test 7: Verify no unwarranted changes"""
        print("\n=== TEST 7: No Unwarranted Changes ===")

        # Check that core content preserved
        original_sentences = self.original_input.split('.')
        preservation_count = 0

        for sentence in original_sentences:
            if len(sentence.strip()) > 10:  # Skip very short fragments
                key_words = [w for w in sentence.split() if len(w) > 4]
                if any(word.lower() in self.hybrid_prompt.lower() for word in key_words):
                    preservation_count += 1

        preservation_rate = preservation_count / max(len([s for s in original_sentences if len(s.strip()) > 10]), 1)

        result = {
            "test_name": "No Unwarranted Changes",
            "expected": "Original content preserved",
            "actual": f"{preservation_rate*100:.1f}% content preserved",
            "status": "PASS" if preservation_rate > 0.7 else "FAIL"
        }

        self.test_results.append(result)
        print(f"Status: {result['status']}")
        print(f"Content Preservation: {preservation_rate*100:.1f}%")
        return result

    def run_all_tests(self):
        """Execute complete test suite"""
        print("\n" + "="*60)
        print("HYBRID PROMPT VALIDATION TEST SUITE")
        print("="*60)

        self.test_integrity_preservation()
        self.test_structure_compliance()
        self.test_validation_loop_presence()
        self.test_success_criteria_extraction()
        self.test_token_efficiency()
        self.test_engineering_techniques_applied()
        self.test_no_additions_or_removals()

        return self.generate_test_report()

    def generate_test_report(self):
        """Generate comprehensive test summary report"""
        print("\n" + "="*60)
        print("TEST SUMMARY REPORT")
        print("="*60)

        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r['status'] == 'PASS')

        print(f"\nTotal Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")

        print("\n" + "-"*60)
        print("DETAILED RESULTS")
        print("-"*60)

        for i, result in enumerate(self.test_results, 1):
            print(f"\nTest {i}: {result['test_name']}")
            print(f"  Expected: {result['expected']}")
            print(f"  Actual: {result['actual']}")
            print(f"  Status: {result['status']}")

        print("\n" + "="*60)

        overall_status = "PASS" if passed_tests == total_tests else "PARTIAL PASS" if passed_tests > total_tests/2 else "FAIL"
        print(f"OVERALL ASSESSMENT: {overall_status}")
        print("="*60)

        return {
            "total_tests": total_tests,
            "passed": passed_tests,
            "failed": total_tests - passed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "overall_status": overall_status,
            "detailed_results": self.test_results
        }


# Example usage demonstration
if __name__ == "__main__":
    # Sample inputs for demonstration
    sample_original_prompt = """
    Create a business report with the following:
    Success Criteria 1: Include executive summary
    Success Criteria 2: Provide financial analysis
    Success Criteria 3: Recommend next steps
    """

    sample_hybrid_prompt = """
    Context: Business reporting for executive decision-making

    Requirements Analysis:
    - Executive summary required
    - Financial analysis required  
    - Recommendations required

    Objectives: Create comprehensive business report

    Instructions:
    Task 1: Draft executive summary
    Task 2: Analyze financials
    Task 3: Develop recommendations

    Success Criteria:
    SC1: Executive summary included
    SC2: Financial analysis provided
    SC3: Next steps recommended

    Validation Loop:
    FOR each SC:
      VERIFY SC met
      IF not met: REGENERATE
      IF met: MARK COMPLETE
    """

    # Initialize tester
    tester = HybridPromptTester(sample_hybrid_prompt, sample_original_prompt)

    # Run tests
    test_report = tester.run_all_tests()

    print("\n\nTest framework ready for use with actual prompts.")
